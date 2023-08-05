require("dotenv").config();
const router = require("express").Router();
const policyService = require("../CRUDService/PolicyService.js");
const { grantAccess } = require("../AccessControl.js");
const projectService = require("../CRUDService/ProjectService.js");
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
            title,
            description,
            user,
            hasJustification,
            hasConsequence,
            organisation,
            purpose,
            sellingData,
            sellingInsights,
            measures,
            recipients,
            recipientsJustification,
            untilTimeDuration,
            durationJustification,
            juridiction,
            thirdCountry,
            thirdCountryJustification
        } = req.body;

        const project = {
            title, description, creator: user, organisation
        };
        try {
            const projectURL = await projectService.createProject(project, appSession);
            const policy = {
                type: "Request",
                project: projectURL,
                creator: user,
                assigner: user,
                assignee: "https://id.inrupt.com/DataConsensus",
                hasJustification,
                hasConsequence,
                purpose,
                sellingData,
                sellingInsights,
                organisation,
                measures,
                recipients,
                recipientsJustification,
                untilTimeDuration,
                durationJustification,
                juridiction,
                thirdCountry,
                thirdCountryJustification,
                thirdPartyApproved: "Approved",
                memberApproved: "Pending",
                adminApproved: "Pending"
            };
            try {
                const policyURL = await policyService.createPolicy(policy, appSession);
                const request = await policyService.fetchProposal(policyURL, appSession);
                // console.log(request);
                res.send({ data: request, message: "Request submitted successfully." });
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
            hasJustification,
            hasConsequence,
            purpose,
            sellingData,
            sellingInsights,
            organisation,
            measures,
            recipients,
            recipientsJustification,
            untilTimeDuration,
            durationJustification,
            juridiction,
            thirdCountry,
            thirdCountryJustification,
            thirdPartyApproved: "Pending",
            memberApproved: "Pending",
            adminApproved: "Pending"
        };
        try {
            const policyURL = await policyService.createPolicy(policy, appSession);
            const offer = await policyService.fetchProposal(policyURL, appSession);
            res.send({ data: offer, message: "Request submitted successfully." });
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
            const { policyID, webID, policyType } = req.query;
            // console.log(`${policyType}#${policyID}`);
            await policyService.removeProposal({ policyURL: `${policyType}#${policyID}`, requester: webID }, appSession);
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
    router.put("/members-approved", async (req, res) => {
        const { policyURL, status } = req.body;

        if (!URL) {
            res.status(400).send({ message: "Request URL is required." });
            return;
        }

        try {
            await policyService.updatePolicyStatus({ policyURL, actor: 'memberApproved', newStatus: status }, appSession);
            if (status == "Rejected") {
                const policy = await policyService.fetchProposal(policyURL, appSession);
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
    */
    router.put("/thirdparty-approved", async (req, res) => {
        try {
            const { policyURL, status } = req.body;
            await policyService.updatePolicyStatus({ policyURL, type: "Offer", actor: 'thirdPartyApproved', newStatus: status }, appSession);
            // console.log("updated");
            const policy = await policyService.fetchProposal(policyURL, appSession);
            // console.log("policy", policy);
            const projectURL = policy.isPartOf;
            // console.log("projectURL", projectURL);
            // console.log("status", status);
            if (status == "Rejected") {
                // console.log("Closed");
                await projectService.updateProject({ projectURL, status: "Closed" }, appSession);
                res.send({ message: "Offer rejected by third party successfully." });
            } else {
                // console.log("AdminApprovalNeeded");
                await projectService.updateProject({ projectURL, status: "AdminApprovalNeeded" }, appSession);
                res.send({ message: "Offer approved by third party successfully." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in approving the offer.", error: error.message });
        }
    });

    /*      
        Expected req.body variables:
        policyURL: string
        status: string
    */
    router.put("/admin-approved", async (req, res) => {
        try {
            const { policyURL, status } = req.body;
            const updatedPolicy = await policyService.updatePolicyStatus({ policyURL, actor: 'adminApproved', newStatus: status }, appSession);
            const projectURL = updatedPolicy.predicates[DCTERMS.isPartOf]["namedNodes"][0];
            if (status == "Approved") {
                await projectService.updateProject({ projectURL, hasAgreement: true, hasAccess: true, status: "Closed" }, appSession);
                const policy = await policyService.fetchProposal(policyURL, appSession);
                const agreement = {
                    type: "Agreement",
                    project: policy.isPartOf,
                    creator: policy.creator,
                    references: policyURL,
                    assigner: policy.assigner,
                    assignee: policy.assignee,
                    hasJustification: policy.hasJustification,
                    hasConsequence: policy.hasConsequence,
                    purpose: policy.purpose,
                    sellingData: policy.sellingData,
                    sellingInsights: policy.sellingInsights,
                    organisation: policy.organisation,
                    measures: policy.techOrgMeasures,
                    recipients: policy.recipients,
                    recipientsJustification: policy.recipientsJustification,
                    untilTimeDuration: policy.untilTimeDuration,
                    durationJustification: policy.durationJustification,
                    juridiction: policy.juridiction,
                    thirdCountry: policy.thirdCountry,
                    thirdCountryJustification: policy.thirdCountryJustification
                };
                await policyService.createPolicy(agreement, appSession)
                const thirdParty = policy.assignee;
                grantAccess(thirdParty, appSession);
                res.send({ message: "Policy approved by admin successfully." });
            }
            else {
                await projectService.updateProject({ projectURL, agreememt: false, status: "Closed" }, appSession);
                res.send({ message: "Policy rejected by admin successfully." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in approving the policy.", error: error.message });
        }
    });

    router.delete("/remove-approval", async (req, res) => {
        try {
            // console.log(`${agreementsList}#${req.query.policyID}`);
            const thirdparty = await policyService.removeAgreement(`${agreementsList}#${req.query.policyID}`, appSession);
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
                const policy = await policyService.fetchProposal(requestURL, appSession);
                requests.push(policy);
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
                    const policy = await policyService.fetchProposal(offerURL, appSession);
                    offers.push(policy);
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
                const policy = await policyService.fetchAgreement(agreementURL, appSession);
                agreements.push(policy);
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
            const policy = await policyService.fetchAgreement(policyURL, appSession);
            res.send({ data: policy });
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
            const policy = await policyService.fetchProposal(policyURL, appSession);
            res.send({ data: policy });
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
            const policy = await policyService.fetchProposal(policyURL, appSession);
            res.send({ data: policy });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });

    return router;
};