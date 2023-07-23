require("dotenv").config();
const router = require("express").Router();
const policyService = require("../CRUDService/PolicyService.js");
const { grantAccess } = require("../AccessControl.js");
const { Agreement, Request, Offer } = require("../Models/Policy.js");
const { Project } = require("../Models/Project.js");
const { DCTERMS } = require("@inrupt/vocab-common-rdf");
const { extractTerm, getPolicyDataset } = require("../HelperFunctions.js");
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
    router.post("/submitRequest", async function (req, res) {
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
                const request = new Request();
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

    router.put("/updateProject", async (req, res) => {
        if (!req.body.projectURL) {
            res.status(400).send({ message: "Project URL is required." });
            return;
        }

        try {
            // Prepare the project object to be updated
            const projectToUpdate = { projectURL: req.body.projectURL };

            if (req.body.title) projectToUpdate.title = req.body.title;
            if (req.body.description) projectToUpdate.description = req.body.description;
            if (req.body.status) projectToUpdate.status = req.body.status;
            if (req.body.startTime) projectToUpdate.startTime = req.body.startTime;
            if (req.body.requestTime) projectToUpdate.requestTime = req.body.requestTime;
            if (req.body.offerTime) projectToUpdate.offerTime = req.body.offerTime;
            if (req.body.threshold) projectToUpdate.threshold = req.body.threshold;
            if (req.body.agreement) projectToUpdate.agreement = req.body.agreement;

            updatedProject = await policyService.updateProject(projectToUpdate, appSession);

            res.send({ data: updatedProject, message: "Project updated successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in updating project.", error: error.message });
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
    router.post("/submitOffer", async (req, res) => {
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
            const offer = new Offer();
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
    router.delete("/removeProposal", async (req, res) => {
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
    router.put("/thirdPartyApproved", async (req, res) => {
        const { policyURL, status } = req.body;

        if (!URL) {
            res.status(400).send({ message: "Request URL is required." });
            return;
        }

        try {
            await policyService.updatePolicyStatus({ policyURL, type: "Offer", actor: 'thirdPartyApproved', newStatus: status }, appSession);
            if (status == "Rejected") {
                const offer = new Offer();
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
    router.put("/adminApproved", async (req, res) => {
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
            if (type === "Offer") {
                proposal = new Offer();
            }
            else if (type === "Request") {
                proposal = new Request();
            }
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

    router.delete("/removeApprovalForAgreement", async (req, res) => {
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

    router.get("/allRequests", async function (req, res) {
        try {
            const requestURLs = await policyService.getpolicyURLs({ type: "Request" }, appSession);
            let requests = [];
            for (const requestURL of requestURLs) {
                const fetchedRequest = new Request();
                const request = await fetchedRequest.fetchPolicy(requestURL, appSession);
                requests.push(fetchedRequest.toJson());
            }
            res.send({ data: requests });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    router.get("/allOffers", async (req, res) => {
        try {
            const offerURLs = await policyService.getpolicyURLs("Agreement", appSession);
            let offers = [];
            for (const offerURL of offerURLs) {
                const fetchedOffer = new Offer();
                const offer = await fetchedOffer.fetchPolicy(offerURL, appSession);
                offers.push(fetchedOffer.toJson());
            }
            res.send({ data: offers });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    router.get("/allAgreements", async (req, res) => {
        try {
            const agreementURLs = await policyService.getpolicyURLs("Agreement", appSession);
            let agreements = [];
            for (const agreementURL of agreementURLs) {
                const fetchedAgreement = new Agreement();
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
    router.get("/getAgreement", async function (req, res) {
        try {
            const policyURL = `${agreementsList}#${req.query.policyID}`;
            let fetchedPolicy = new Agreement();

            if (fetchedPolicy) {
                const policy = await fetchedPolicy.fetchPolicy(policyURL, appSession);
                res.send({ data: fetchedPolicy.toJson() });
            } else {
                res.status(400).send({ message: "Invalid policy type." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });

    /*  
        Expected req.body variables:
        policyURL: string 
    */
    router.get("/getRequest", async function (req, res) {
        try {
            const policyURL = `${requestsList}${req.query.policyID}`;
            let fetchedPolicy = new Request();
            if (fetchedPolicy) {
                const policy = await fetchedPolicy.fetchPolicy(policyURL, appSession);
                res.send({ data: fetchedPolicy.toJson() });
            } else {
                res.status(400).send({ message: "Invalid policy type." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });
    /*  
        Expected req.body variables:
        policyURL: string 
    */
    router.get("/getOffer", async function (req, res) {
        try {
            const policyURL = `${offersList}${req.query.policyID}`;
            let fetchedPolicy = new Offer();
            if (fetchedPolicy) {
                const policy = await fetchedPolicy.fetchPolicy(policyURL, appSession);
                res.send({ data: fetchedPolicy.toJson() });
            } else {
                res.status(400).send({ message: "Invalid policy type." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });


    /*  
        Expected req.body variables:
        projectURL: string 
    */
    router.get("/getProject", async function (req, res) {
        try {
            const projectURL = req.body.projectURL;
            const fetchedProject = new Project();
            const project = await fetchedProject.fetchProject(projectURL, appSession);
            res.send({ data: fetchedProject.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: "Error in getting project",
            });
        }
    });


    return router;
};