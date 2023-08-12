require("dotenv").config();
const router = require("express").Router();
const { DCTERMS } = require("@inrupt/vocab-common-rdf");
const policyService = require("../CRUDService/PolicyService.js");
const projectService = require("../CRUDService/ProjectService.js");
const userService = require("../CRUDService/UserService.js");
const { Policy, Agreement } = require("../Models/Policy.js");
const { getPolicyType } = require("../HelperFunctions.js");
const { grantAccess, removeAccess } = require("../AccessControl.js");

const agreementsList = process.env.AGREEMENTS;
const requestsList = process.env.REQUESTS;
const offersList = process.env.OFFERS;

module.exports = function (appSession) {
    /* 
        Expected req.body variables:
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
            thirdCountryJustification,
        } = req.body;

        const project = {
            title, description, creator: user, organisation
        };
        try {
            const projectURL = await projectService.createProject(project, appSession);
            const policy = {
                type: "REQUEST",
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
                const request = await policyService.fetchPolicy(policyURL, appSession);
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
            project,
            user,
            requester,
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
    */
    router.post("/submit-offer", async (req, res) => {
        const {
            project,
            user,
            requester,
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

        const policy = {
            type: "OFFER",
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
            const offer = await policyService.fetchPolicy(policyURL, appSession);
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
            status: string
    */
    router.put("/thirdparty-approved", async (req, res) => {
        try {
            const { policyURL, status } = req.body;
            await policyService.updatePolicyStatus({ policyURL, type: "Offer", actor: 'thirdPartyApproved', newStatus: status }, appSession);
            const policy = await policyService.fetchPolicy(policyURL, appSession);
            const projectURL = policy.isPartOf;
            if (status == "Rejected") {
                await projectService.updateProject({ projectURL, status: "Closed" }, appSession);
                res.send({ message: "Offer rejected by third party successfully." });
            } else {
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
                const policy = await policyService.fetchPolicy(policyURL, appSession);
                const agreement = {
                    type: "AGREEMENT",
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

    /*      
        Expected req.query variables:
            policyURL: string
            webID: string
            policyType: string
    */
    router.delete("/remove-offer", async (req, res) => {
        try {
            const { policyID, webID } = req.query;
            await policyService.removeProposal({ policyURL: `${offersList}#${policyID}`, requester: webID }, appSession);
            res.send({ message: "Policy deleted successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in deleting the policy.", error: error.message });
        }
    });

    /*      
        Expected req.query variables:
            policyURL: string
            webID: string
            policyType: string
    */
    router.put("/revoke-approval", async (req, res) => {
        try {
            const { policyURL, webID } = req.body;
            const { isUser, type } = await userService.checkUser(webID, appSession);
            let actorType = "";
            const policy = await policyService.fetchPolicy(policyURL, appSession);
            if (type !== "MEMBER") {
                switch (type) {
                    case "THIRDPARTY":
                        actorType = "thirdPartyApproved";
                        otherType = "adminApproved";
                        break;
                    case "ADMIN":
                        actorType = "adminApproved";
                        otherType = "thirdPartyApproved";
                        break;
                }
                if (getPolicyType(policyURL) === "AGREEMENT") {
                    if (policy.assignee === webID || type === "ADMIN") {
                        await policyService.updatePolicyStatus({ policyURL, actor: actorType, newStatus: "Revoked" }, appSession);
                        await policyService.updatePolicyStatus({ policyURL: policy.references, actor: actorType, newStatus: "Revoked" }, appSession);
                        await projectService.updateProject({ projectURL: policy.isPartOf, hasAgreement: false, hasAccess: false, status: "Revoked" }, appSession);
                        removeAccess(policy.assignee, appSession);
                        res.send({ message: "Agreement successfully revoked" });
                    } else {
                        res.send({ message: "User is not authorized to revoke the agreement" });
                    }
                } else {
                    if (policy.creator === webID || type === "ADMIN") {
                        await policyService.updatePolicyStatus({ policyURL, actor: actorType, newStatus: "Revoked" }, appSession);
                        await policyService.updatePolicyStatus({ policyURL, actor: "memberApproved", newStatus: "Blocked" }, appSession);
                        await policyService.updatePolicyStatus({ policyURL, actor: otherType, newStatus: "Blocked" }, appSession);

                        await projectService.updateProject({ projectURL: policy.isPartOf, hasAgreement: false, hasAccess: false, status: "Closed" }, appSession);
                        res.send({ message: "Proposal successfully revoked" });
                    } else {
                        res.send({ message: "User is not authorized to revoke the proposal" });
                    }
                }
            } else {
                res.send({ message: "User is not authorized to revoke the policy" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing proposal", error: error.message });
        }
    });

    /* FETCHING */

    router.get("/all-requests", async function (req, res) {
        try {
            const requestURLs = await policyService.getpolicyURLs("REQUEST", appSession);
            let requests = [];
            for (const requestURL of requestURLs) {
                const policy = await policyService.fetchPolicy(requestURL, appSession);
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
            const offerURLs = await policyService.getpolicyURLs("OFFER", appSession);
            let offers = [];
            for (const offerURL of offerURLs) {
                if (offerURL === "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/policies/offers.ttl#rejection") {
                    continue;
                }
                else {
                    const policy = await policyService.fetchPolicy(offerURL, appSession);
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
            const agreementURLs = await policyService.getpolicyURLs("AGREEMENT", appSession);
            let agreements = [];
            for (const agreementURL of agreementURLs) {
                const policy = await policyService.fetchPolicy(agreementURL, appSession);
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
            const policy = await policyService.fetchPolicy(policyURL, appSession);
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
            const policy = await policyService.fetchPolicy(policyURL, appSession);
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
            const policy = await policyService.fetchPolicy(policyURL, appSession);
            res.send({ data: policy });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting policies", error: error.message });
        }
    });

    return router;
};