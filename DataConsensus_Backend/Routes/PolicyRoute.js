require("dotenv").config();
const express = require('express');
const router = express.Router();
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");
const service = require("./CRUDService.js");
import { grantAccess } from "./AccessControl.js";

const resourceURL = process.env.RESOURCE_URL;

/* SUBMISSION */

app.post("/submitRequest", async function (req, res) {
    const {
        title, description, user, organisation, purpose, sellingData, sellingInsights, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration
    } = req.body;

    // Create a project
    const project = {
        title, description, creator: user, organisation
    };
    try {
        const projectID = await service.createProject(project, applicationSession.sessionId);
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
            await service.createPolicy(policy, applicationSession.sessionId);
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

app.post("/submitOffer", async (req, res) => {
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
        await service.createPolicy(policy, applicationSession.sessionId);
        res.send({ message: "Offer submitted successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in submitting offer.", error: error.message });
    }
});

/* APPROVAL */
app.put("/approveRequest", async (req, res) => {
    const { URL, status } = req.body;

    if (!URL) {
        res.status(400).send({ message: "URL is required." });
        return;
    }

    try {
        await service.updatePolicyStatus({ policyURL: URL, actor: 'thirdPartyApproved', newStatus: status }, applicationSession.sessionId);
        res.send({ message: "Request approved by third party successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in approving the policy.", error: error.message });
    }
});

app.put("/approvePolicy", async (req, res) => {
    const { URL, status } = req.body;

    if (!URL) {
        res.status(400).send({ message: "URL is required." });
        return;
    }

    try {
        await service.updatePolicyStatus({ policyURL: URL, actor: 'adminApproved', newStatus: status }, applicationSession.sessionId);
        await service.updateProject({ projectURL: URL, agreememt: true }, applicationSession.sessionId);
        const policy = await service.getPolicy(URL, applicationSession.sessionId)
        await service.createPolicy()
        const thirdParty = policy.assignee;
        grantAccess(resourceURL, thirdParty);
        res.send({ message: "Policy approved by admin successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in approving the policy.", error: error.message });
    }
});

app.put("/updateProject", async (req, res) => {
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
        await service.updateProject(projectToUpdate, applicationSession.sessionId);

        res.send({ message: "Project updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in updating project.", error: error.message });
    }
});

/* FETCHING */

app.get("/allRequests", async function (req, res) {
    try {
        const requests = await service.getPolicies("Request", applicationSession.sessionId);
        res.send({ data: requests });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

app.get("/allOffers", async (req, res) => {
    try {
        const offers = await service.getPolicies("Offer", applicationSession.sessionId);
        res.send({ data: offers });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

app.get("/allAgreements", async (req, res) => {
    try {
        const agreements = await service.getPolicies("Agreement", applicationSession.sessionId);
        res.send({ data: agreements });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

app.get("/getPolicy", async function (req, res) {
    try {
        const policy = await service.getPolicy(req.body.url, applicationSession.sessionId);
        res.send({ data: policy });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in getting requests", error: error.message });
    }
});

/* REMOVAL */

app.delete("/removeOffer", async (req, res) => {
    try {
        await service.removePolicy("Offer", req.body.id, applicationSession.sessionId);
        res.send({ message: "Offer removed successfully" });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in removing offer", error: error.message });
    }
});

app.delete("/removeRequest", async (req, res) => {
    try {
        await service.removePolicy("Request", req.body.id, applicationSession.sessionId);
        res.send({ message: "Request removed successfully" });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in removing request", error: error.message });
    }
});

app.delete("/removeAgreement", async (req, res) => {
    try {
        await service.removePolicy("Agreement", req.body.id, applicationSession.sessionId);
        res.send({ message: "Agreement removed successfully" });
    } catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in removing agreement", error: error.message });
    }
});