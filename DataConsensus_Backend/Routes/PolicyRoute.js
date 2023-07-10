require("dotenv").config();
const router = require("express").Router();
const service = require("../CRUDService.js");
const { grantAccess } = require("../AccessControl.js");
const { appSession } = require('../Index.js');
const { Policy, Agreement, Proposal } = require("../Models/Policy.js");

const resourceURL = process.env.RESOURCE_URL;

/* SUBMISSION */

router.post("/submitRequest", async function (req, res) {
    const {
        title, description, user, organisation, purpose, sellingData, sellingInsights, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration
    } = req.body;

    // Create a project
    const project = {
        title, description, creator: user, organisation
    };
    try {
        const projectID = await service.createProject(project, appSession.sessionId);
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
            await service.createPolicy(policy, appSession.sessionId);
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
        await service.createPolicy(policy, appSession.sessionId);
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
        await service.updatePolicyStatus({ policyURL: URL, actor: 'thirdPartyApproved', newStatus: status }, appSession.sessionId);
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
        await service.updatePolicyStatus({ policyURL: URL, actor: 'adminApproved', newStatus: status }, appSession.sessionId);
        await service.updateProject({ projectURL: URL, agreememt: true }, appSession.sessionId);
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
        await service.createPolicy(agreement, appSession.sessionId)
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
        await service.updateProject(projectToUpdate, appSession.sessionId);

        res.send({ message: "Project updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in updating project.", error: error.message });
    }
});

/* FETCHING */

router.get("/allRequests", async function (req, res) {
    try {
        const requests = await service.getPolicies("Request", appSession.sessionId);
        res.send({ data: requests });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

router.get("/allOffers", async (req, res) => {
    try {
        const offers = await service.getPolicies("Offer", appSession.sessionId);
        res.send({ data: offers });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

router.get("/allAgreements", async (req, res) => {
    try {
        const agreements = await service.getPolicies("Agreement", appSession.sessionId);
        res.send({ data: agreements });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

router.get("/getPolicy", async function (req, res) {
    try {
        const policy = await service.getPolicy(req.body.url, appSession.sessionId);
        res.send({ data: policy });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

/* REMOVAL */

router.delete("/removeOffer", async (req, res) => {
    try {
        await service.removePolicy("Offer", req.body.id, routerlicationSession.sessionId);
        res.send({ message: "Offer removed successfully" });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in removing offer", error: error.message });
    }
});

router.delete("/removeRequest", async (req, res) => {
    try {
        await service.removePolicy("Request", req.body.id, appSession.sessionId);
        res.send({ message: "Request removed successfully" });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in removing request", error: error.message });
    }
});

router.delete("/removeAgreement", async (req, res) => {
    try {
        await service.removePolicy("Agreement", req.body.id, appSession.sessionId);
        res.send({ message: "Agreement removed successfully" });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in removing agreement", error: error.message });
    }
});

module.exports = router;