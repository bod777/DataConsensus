require("dotenv").config();
const router = require("express").Router();
const projectService = require("../CRUDService/ProjectService.js");
const policyService = require("../CRUDService/PolicyService.js");
const VoteCounter = require("../Logic/VoteCounter.js");
const { isDatetimePassed } = require("../HelperFunctions.js");
const { removeAccess } = require("../AccessControl.js");

const projectsList = process.env.PROJECTS;
const agreementsList = process.env.AGREEMENTS;
const requestsList = process.env.REQUESTS;
const offersList = process.env.OFFERS;

module.exports = function (appSession) {
    router.put("/update-project", async (req, res) => {
        if (!req.body.projectID) {
            res.status(400).send({ message: "Project URL is required." });
        }
        else {
            try {
                projectURL = `${projectsList}#${req.body.projectID}`
                const projectToUpdate = { projectURL };

                if (req.body.title) projectToUpdate.title = req.body.title;
                if (req.body.description) projectToUpdate.description = req.body.description;
                if (req.body.status) projectToUpdate.status = req.body.status;
                if (req.body.requestStartTime) projectToUpdate.requestStartTime = req.body.requestStartTime;
                if (req.body.requestEndTime) projectToUpdate.requestEndTime = req.body.requestEndTime;
                if (req.body.offerEndTime) projectToUpdate.offerEndTime = req.body.offerEndTime;
                if (req.body.threshold) projectToUpdate.threshold = req.body.threshold;
                if (req.body.hasAgreement) projectToUpdate.hasAgreement = req.body.hasAgreement;
                if (req.body.hasAccess) projectToUpdate.hasAccess = req.body.hasAccess;

                updatedProject = await projectService.updateProject(projectToUpdate, appSession);

                res.send({ data: updatedProject, message: "Project updated successfully." });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Error in updating project.", error: error.message });
            }
        }
    });

    /* FETCHING */

    router.get("/all-projects", async (req, res) => {
        try {
            const projects = await projectService.getProjects(appSession);
            const updatedProjects = projects.map(async project => await updateProjectStatus(project));
            const projectList = await Promise.all(updatedProjects);
            res.send({ data: projectList });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in getting requests", error: error.message });
        }
    });

    /*  
        Expected req.body variables:
        projectURL: string 
    */
    router.get("/project", async function (req, res) {
        try {
            const projectURL = `${projectsList}#${req.query.projectID}`;
            const fetchedProject = await projectService.getProject(projectURL, appSession);
            const updatedProjects = await updateProjectStatus(fetchedProject);
            res.send({ data: updatedProjects });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: "Error in getting project",
            });
        }
    });

    async function updateProjectStatus(project) {
        if (project.projectStatus === "Pending" && isDatetimePassed(project.requestStartTime)) {
            project.projectStatus = "RequestDeliberation";
            updatedProject = await projectService.updateProject({ projectURL: project.URL, status: project.projectStatus }, appSession);
        }
        else if (project.projectStatus === "RequestDeliberation" && isDatetimePassed(project.requestEndTime) && project.results.request.error !== "requestEndTime is not passed yet") {
            const projectToUpdate = { policyURL: project.projectPolicies.requests[0].URL, actor: "memberApproved" };
            if (project.results.request.result === true) {
                project.projectPolicies.requests[0].memberApproved = "Approved";
                projectToUpdate.newStatus = "Approved";
                await policyService.updatePolicyStatus(projectToUpdate, appSession);
            }
            else if (project.results.request.result === false) {
                project.projectPolicies.requests[0].memberApproved = "Rejected";
                projectToUpdate.newStatus = "Rejected";
                await policyService.testfunction();
                await policyService.updatePolicyStatus(projectToUpdate, appSession);
                await policyService.updatePolicyStatus({ policyURL: project.projectPolicies.requests[0].URL, actor: "adminApproved", newStatus: "Blocked" }, appSession);
            }
            const oldStatus = project.projectStatus;
            if (project.results.request.result === false && project.projectPolicies.offers.length !== 0) {
                project.projectStatus = "OfferDeliberation";
            }
            else if (project.results.request.result === false && project.projectPolicies.offers.length === 0) {
                project.projectStatus = "Closed";
            }
            else {
                project.projectStatus = "AdminApprovalNeeded";
            }
            if (oldStatus !== project.projectStatus) {
                updatedProject = await projectService.updateProject({ projectURL: project.URL, status: project.projectStatus }, appSession);
            }
        }
        else if (project.projectStatus === "OfferDeliberation" && isDatetimePassed(project.offerEndTime) && project.results.offers.error !== "offerEndTime has not passed yet or no offer to deliberate occured") {
            for (let i = 0; i < project.results.offers.sortedResults.length - 1; i++) {
                const policyURL = project.results.offers.sortedResults[i].policyUrl;
                const memberUpdate = { policyURL, actor: "memberApproved", newStatus: "Rejected" };
                const adminUpdate = { policyURL, actor: "adminApproved", newStatus: "Pending" };
                const thirdPartyUpdate = { policyURL, actor: "thirdPartyApproved", newStatus: "Pending" };
                const oldMemberStatus = project.projectPolicies.offers[i].memberApproved;
                const oldAdminStatus = project.projectPolicies.offers[i].adminApproved;
                const oldThirdStatus = project.projectPolicies.offers[i].thirdPartyApproved;
                if (project.results.offers.winner === policyURL) {
                    project.projectPolicies.offers[i].memberApproved = "Approved";
                } else if (policyToUpdate.policyURL !== `${offersList}#rejection`) {
                    project.projectPolicies.offers[i].memberApproved = "Rejected";
                    project.projectPolicies.offers[i].adminApproved = "Blocked";
                    project.projectPolicies.offers[i].thirdPartyApproved = "Blocked";
                }
                if (oldMemberStatus !== project.projectPolicies.offers[i].memberApproved) {
                    memberUpdate.newStatus = project.projectPolicies.offers[i].memberApproved;
                    await policyService.updatePolicyStatus(memberUpdate, appSession);
                }
                if (oldAdminStatus !== project.projectPolicies.offers[i].adminApproved) {
                    adminUpdate.newStatus = project.projectPolicies.offers[i].adminApproved;
                    await policyService.updatePolicyStatus(adminUpdate, appSession);
                }
                if (oldThirdStatus !== project.projectPolicies.offers[i].thirdPartyApproved) {
                    thirdPartyUpdate.newStatus = project.projectPolicies.offers[i].thirdPartyApproved;
                    await policyService.updatePolicyStatus(thirdPartyUpdate, appSession);
                }
            }
            const oldStatus = project.projectStatus;
            if (project.results.offers.winner !== "rejection") {
                project.projectStatus = "ThirdPartyApprovalNeeded";
            } else {
                project.projectStatus = "Closed";
            }
            if (oldStatus !== project.projectStatus) {
                updatedProject = await projectService.updateProject({ projectURL: project.URL, status: project.projectStatus }, appSession);
            }
        }
        if (project.hasAgreement === true) {
            if (isDatetimePassed(project.projectPolicies.agreements[0].untilTimeDuration)) {
                project.hasAccess = false;
                updatedProject = await projectService.updateProject({ projectURL: project.URL, hasAccess }, appSession);
                removeAccess(project.creator, appSession);
            }
        }

        return project;
    }

    return router;
};