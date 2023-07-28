require("dotenv").config();
const router = require("express").Router();
const policyService = require("../CRUDService/PolicyService.js");
const { grantAccess } = require("../AccessControl.js");
const { Agreement, Proposal } = require("../Models/Policy.js");
const { DCTERMS } = require("@inrupt/vocab-common-rdf");
const { extractTerm } = require("../HelperFunctions.js");
const { removeAccess } = require("../AccessControl.js");

const agreementsList = process.env.AGREEMENTS;
const requestsList = process.env.REQUESTS;
const offersList = process.env.OFFERS;

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

    /* 
        Expected req.body variables:
        title: string
        description: string
        user: string
        organisation: string
        purpose: string
        sellingData: string
        sellingInsights: string
        measures: string
        recipients: string
        untilTimeDuration: string
    */
    router.post("/submit-request", async function (req, res) {
        const {
            title, description, user, organisation, purpose, sellingData, sellingInsights, measures, recipients, untilTimeDuration
        } = req.body;

        const project = {
            title, description, creator: user, organisation
        };
        try {
            const projectURL = await policyService.createProject(project, appSession);
            const policy = {
                type: "Request",
                project: projectURL,
                creator: user,
                assigner: user,
                assignee: "https://id.inrupt.com/DataConsensus",
                purpose,
                sellingData,
                sellingInsights,
                organisation,
                measures,
                recipients,
                untilTimeDuration,
                thirdPartyApproved: "Approved",
                memberApproved: "Pending",
                adminApproved: "Pending"
            };
            try {
                const policyURL = await policyService.createPolicy(policy, appSession);
                const request = new Proposal();
                await request.fetchPolicy(policyURL, appSession);
                res.send({ data: request.toJson(), message: "Request submitted successfully." });
            }
            catch (error) {
                console.error(error);
                res.status(500).send({ message: "Error in submitting request.", error: error.message });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in creating project.", error: error.message });
        }
    });

    /* 
        Expected req.body variables:
        title: string
        description: string
        user: string
        requester: string
        organisation: string
        purpose: string
        sellingData: string
        sellingInsights: string
        measures: string
        recipients: string
        untilTimeDuration: string
    */
    router.post("/submit-offer", async (req, res) => {
        const {
            project, user, requester, purpose, sellingData, sellingInsights, organisation, measures, recipients, untilTimeDuration
        } = req.body;

        const policy = {
            type: "Offer",
            project,
            creator: user,
            assigner: requester,
            assignee: "https://id.inrupt.com/DataConsensus",
            purpose,
            sellingData,
            sellingInsights,
            organisation,
            measures,
            recipients,
            untilTimeDuration,
            thirdPartyApproved: "Pending",
            memberApproved: "Pending",
            adminApproved: "Pending"
        };
        try {
            const policyURL = await policyService.createPolicy(policy, appSession);
            const offer = new Proposal();
            await offer.fetchPolicy(policyURL, appSession);
            res.send({ data: offer.toJson(), message: "Request submitted successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in submitting offer.", error: error.message });
        }
    });

    /*      
        Expected req.body variables:
        policyURL: string
        webID: string
    */
    router.delete("/remove-proposal", async (req, res) => {
        try {
            await policyService.removeProposal({ policyURL: req.body.policyURL, requester: req.body.webID }, appSession);
            res.send({ message: "Proposal removed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing proposal", error: error.message });
        }
    });

    /*      
        Expected req.body variables:
        policyURL: string
        status: string
    */
    router.put("/thirdparty-approved", async (req, res) => {
        const { policyURL, status } = req.body;

        if (!URL) {
            res.status(400).send({ message: "Request URL is required." });
            return;
        }

        try {
            await policyService.updatePolicyStatus({ policyURL, type: "Offer", actor: 'thirdPartyApproved', newStatus: status }, appSession);
            if (status == "Rejected") {
                const offer = new Proposal();
                const policy = await offer.fetchPolicy(policyURL, appSession);
                const projectURL = policy.isPartOf;
                await policyService.updateProject({ projectURL, status: "Completed" }, appSession);
            }
            res.send({ message: "Offer response by third party received." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in approving the offer.", error: error.message });
        }
    });

    /*      
        Expected req.body variables:
        policyURL: string
        status: string
        type: string
    */
    router.put("/admin-approved", async (req, res) => {
        const { policyURL, status, type } = req.body;

        if (!policyURL) {
            res.status(400).send({ message: "URL is required." });
            return;
        }

        try {
            const updatedPolicy = await policyService.updatePolicyStatus({ policyURL, type: type, actor: 'adminApproved', newStatus: status }, appSession);
            const projectURL = updatedPolicy.predicates[DCTERMS.isPartOf]["namedNodes"][0];
            if (status == "Approved") {
                await policyService.updateProject({ projectURL, agreememt: true, status: "Completed" }, appSession);
            }
            else {
                await policyService.updateProject({ projectURL, agreememt: false, status: "Completed" }, appSession);
            }
            let proposal;
            proposal = new Proposal();
            let policy = await proposal.fetchPolicy(policyURL, appSession);
            policy = await proposal.toJson();
            const organisationTerm = extractTerm(policy.organisation);
            const purposeTerm = extractTerm(policy.organisation);
            const measureTerms = policy.techOrgMeasures.map(item => extractTerm(item));
            const agreement = {
                type: "Agreement",
                project: policy.isPartOf,
                creator: policy.creator,
                references: policyURL,
                assigner: policy.assigner,
                assignee: policy.assignee,
                purpose: purposeTerm,
                sellingData: policy.sellingData,
                sellingInsights: policy.sellingInsights,
                organisation: organisationTerm,
                measures: measureTerms,
                recipients: policy.recipients,
                untilTimeDuration: policy.untilTimeDuration
            };
            await policyService.createPolicy(agreement, appSession)
            const thirdParty = policy.assignee;
            grantAccess(thirdParty);
            res.send({ message: "Policy approved by admin successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in approving the policy.", error: error.message });
        }
    });

    router.delete("/remove-approval", async (req, res) => {
        try {
            const thirdparty = await policyService.removeAgreement(req.body.policyURL, appSession);
            removeAccess(thirdparty, appSession);
            res.send({ message: "Agreement removed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing agreement", error: error.message });
        }
    });

    /* FETCHING */

    router.get("/all-requests", async function (req, res) {
        try {
            const requestURLs = await policyService.getpolicyURLs("Request", appSession);
            let requests = [];
            for (const requestURL of requestURLs) {
                const fetchedRequest = new Proposal();
                const request = await fetchedRequest.fetchPolicy(requestURL, appSession);
                requests.push(fetchedRequest.toJson());
            }
            res.send({ data: requests });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    router.get("/all-offers", async (req, res) => {
        try {
            const offerURLs = await policyService.getpolicyURLs("Offer", appSession);
            let offers = [];
            for (const offerURL of offerURLs) {
                if (offerURL === "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/policies/offers.ttl#rejection") {
                    continue;
                }
                else {
                    const fetchedOffer = new Proposal();
                    const offer = await fetchedOffer.fetchPolicy(offerURL, appSession);
                    offers.push(fetchedOffer.toJson());
                }
            }
            res.send({ data: offers });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    router.get("/all-agreements", async (req, res) => {
        try {
            const agreementURLs = await policyService.getpolicyURLs("Agreement", appSession);
            let agreements = [];
            for (const agreementURL of agreementURLs) {
                const fetchedAgreement = new Agreement();
                console.log(agreementURL);
                const agreement = await fetchedAgreement.fetchPolicy(agreementURL, appSession);
                agreements.push(fetchedAgreement.toJson());
            }
            res.send({ data: agreements });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    /*  
        Expected req.body variables:
        policyURL: string 
    */
    router.get("/agreement", async function (req, res) {
        try {
            const policyURL = `${agreementsList}#${req.query.policyID}`;
            console.log(policyURL);
            let fetchedPolicy = new Agreement();
            await fetchedPolicy.fetchPolicy(policyURL, appSession);
            console.log(fetchedPolicy.toJson());
            res.send({ data: fetchedPolicy.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });

    /*  
        Expected req.body variables:
        policyURL: string 
    */
    router.get("/request", async function (req, res) {
        try {
            const policyURL = `${requestsList}#${req.query.policyID}`;
            let fetchedPolicy = new Proposal();
            const policy = await fetchedPolicy.fetchPolicy(policyURL, appSession);
            res.send({ data: fetchedPolicy.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });
    /*  
        Expected req.body variables:
        policyURL: string 
    */
    router.get("/offer", async function (req, res) {
        try {
            const policyURL = `${offersList}#${req.query.policyID}`;
            let fetchedPolicy = new Proposal();
            const policy = await fetchedPolicy.fetchPolicy(policyURL, appSession);
            res.send({ data: fetchedPolicy.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });

    router.get("/thirdparty-approval-needed", async function (req, res) {
        const offersURLs = await policyService.getpolicyURLs("Offer", appSession);
        let policies = [];
        for (const policyURL of offersURLs) {
            if (policyURL !== `${offersList}#rejection`) {
                const fetchedPolicies = new Proposal();
                await fetchedPolicies.fetchPolicy(policyURL, appSession);
                policies.push(fetchedPolicies.toJson());
            }
        }
        const pendingPolicies = policies.filter(policy =>
            policy.adminApproved === "Pending" &&
            policy.thirdPartyApproved === "Pending" &&
            policy.memberApproved === "Approved"
        );
        res.send({ message: "Success", data: pendingPolicies });
    });

    router.get("/admin-approval-needed", async function (req, res) {
        const requestsURLs = await policyService.getpolicyURLs("Request", appSession);
        const offersURLs = await policyService.getpolicyURLs("Offer", appSession);
        const policiesURLs = requestsURLs.concat(offersURLs);
        let policies = [];
        for (const policyURL of policiesURLs) {
            if (policyURL !== `${offersList}#rejection`) {
                const fetchedPolicies = new Proposal();
                await fetchedPolicies.fetchPolicy(policyURL, appSession);
                policies.push(fetchedPolicies.toJson());
            }
        }
        const pendingPolicies = policies.filter(policy =>
            policy.adminApproved === "Pending" &&
            policy.thirdPartyApproved === "Approved" &&
            policy.memberApproved === "Approved"
        );
        res.send({ message: "Success", data: pendingPolicies });
    });

    return router;
};