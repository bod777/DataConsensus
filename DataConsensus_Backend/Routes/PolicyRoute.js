require("dotenv").config();
const router = require("express").Router();
const policyService = require("../CRUDService/PolicyService.js");
const { grantAccess } = require("../AccessControl.js");
const { Agreement, Request, Offer } = require("../Models/Policy.js");
// work out how to include the user models

const resourceURL = process.env.RESOURCE_URL;

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

    /* SUBMISSION */
    router.post("/submitRequest", async function (req, res) {
        const {
            title, description, user, organisation, purpose, sellingData, sellingInsights, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration
        } = req.body;

        const project = {
            title, description, creator: user, organisation
        };
        try {
            const projectID = await policyService.createProject(project, appSession.sessionId);
            const policy = {
                type: "Request",
                project: projectID,
                creator: user,
                assigner: user,
                assignee: "<https://id.inrupt.com/DataConsensus>",
                purpose,
                sellingData,
                sellingInsights,
                organisation,
                technicalMeasures,
                organisationalMeasures,
                recipients,
                untilTimeDuration,
                thirdPartyApproved: "Approved",
                memberApproved: "Pending",
                adminApproved: "Pending"
            };
            try {
                await policyService.createPolicy(policy, appSession.sessionId);
                res.send({ message: "Request submitted successfully." });
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

    router.post("/submitOffer", async (req, res) => {
        const {
            project, user, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration
        } = req.body;

        const policy = {
            type: "Offer",
            project,
            creator: user,
            assigner: user,
            assignee: "<https://id.inrupt.com/DataConsensus>",
            purpose,
            sellingData,
            sellingInsights,
            organisation,
            technicalMeasures,
            organisationalMeasures,
            recipients,
            untilTimeDuration,
            thirdPartyApproved: "Pending",
            memberApproved: "Pending",
            adminApproved: "Pending"
        };
        try {
            await policyService.createPolicy(policy, appSession.sessionId);
            res.send({ message: "Offer submitted successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in submitting offer.", error: error.message });
        }
    });

    /* APPROVAL */
    router.put("/approveRequest", async (req, res) => {
        const { URL, status } = req.body;

        if (!URL) {
            res.status(400).send({ message: "URL is required." });
            return;
        }

        try {
            await policyService.updatePolicyStatus({ policyURL: URL, actor: 'thirdPartyApproved', newStatus: status }, appSession.sessionId);
            res.send({ message: "Request approved by third party successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in approving the policy.", error: error.message });
        }
    });

    router.put("/approvePolicy", async (req, res) => {
        const { URL, status } = req.body;

        if (!URL) {
            res.status(400).send({ message: "URL is required." });
            return;
        }

        try {
            await policyService.updatePolicyStatus({ policyURL: URL, actor: 'adminApproved', newStatus: status }, appSession.sessionId);
            await policyService.updateProject({ projectURL: URL, agreememt: true }, appSession.sessionId);
            const policy = await proposal.fetchPolicy(URL, appSession.sessionId);
            const agreement = {
                type: "Agreement",
                project: policy.partOf,
                creator: policy.creator,
                references: URL,
                assigner: policy.assigner,
                assignee: policy.assignee,
                purpose: policy.purpose,
                sellingData: policy.sellingData,
                sellingInsights: policy.sellingInsights,
                organisation: policy.organisation,
                orgTechMeasures: policy.techOrgMeasures,
                recipients: policy.recipients,
                untilTimeDuration: policy.untilTimeDuration
            };
            await policyService.createPolicy(agreement, appSession.sessionId)
            const thirdParty = policy.assignee;
            grantAccess(resourceURL, thirdParty);
            res.send({ message: "Policy approved by admin successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in approving the policy.", error: error.message });
        }
    });

    router.put("/updateProject", async (req, res) => {
        const {
            projectURL, title, description, requestTime, offerTime, threshold, agreement
        } = req.body;

        // Check if projectURL is provided
        if (!projectURL) {
            res.status(400).send({ message: "Project URL is required." });
            return;
        }

        try {
            // Prepare the project object to be updated
            const projectToUpdate = { projectURL };

            // Only add properties to the object if they're provided in the request
            if (title) projectToUpdate.title = title;
            if (description) projectToUpdate.description = description;
            if (requestTime) projectToUpdate.requestTime = requestTime;
            if (offerTime) projectToUpdate.offerTime = offerTime;
            if (threshold) projectToUpdate.threshold = threshold;
            if (agreement) projectToUpdate.agreement = agreement;

            // Call the updateProject function
            await policyService.updateProject(projectToUpdate, appSession.sessionId);

            res.send({ message: "Project updated successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in updating project.", error: error.message });
        }
    });

    /* FETCHING */

    router.get("/allRequests", async function (req, res) {
        try {
            const requestURLs = await policyService.getPolicyURLs({ type: "Request" }, appSession);
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
            const offerURLs = await policyService.getPolicyUrls("Agreement", appSession);
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
            const agreementURLs = await policyService.getPolicyUrls("Agreement", appSession);
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

    router.get("/getAgreement", async function (req, res) {
        try {
            const fetchedAgreement = new Agreement();
            const policy = await fetchedAgreement.fetchPolicy(req.body.url, appSession);
            res.send({ data: fetchedAgreement.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    router.get("/getRequest", async function (req, res) {
        try {
            const fetchedProposal = new Request();
            const policy = await fetchedProposal.fetchPolicy(req.body.url, appSession);
            res.send({ data: fetchedProposal.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    router.get("/getOffer", async function (req, res) {
        try {
            const fetchedProposal = new Offer();
            const policy = await fetchedProposal.fetchPolicy(req.body.url, appSession);
            res.send({ data: fetchedProposal.toJson() });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    /* REMOVAL */

    router.delete("/removeOffer", async (req, res) => {
        try {
            await policyService.removePolicy("Offer", req.body.id, routerlicationSession.sessionId);
            res.send({ message: "Offer removed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing offer", error: error.message });
        }
    });

    router.delete("/removeRequest", async (req, res) => {
        try {
            await policyService.removePolicy("Request", req.body.id, appSession.sessionId);
            res.send({ message: "Request removed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing request", error: error.message });
        }
    });

    router.delete("/removeAgreement", async (req, res) => {
        try {
            await policyService.removePolicy("Agreement", req.body.id, appSession.sessionId);
            res.send({ message: "Agreement removed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing agreement", error: error.message });
        }
    });

    return router;
};