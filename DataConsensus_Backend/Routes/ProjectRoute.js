require("dotenv").config();
const router = require("express").Router();
const projectService = require("../CRUDService/ProjectService.js");
const { isDatetimePassed } = require("../HelperFunctions.js");
const { removeAccess } = require("../AccessControl.js");
const voteService = require("../CRUDService/VoteService.js");
const userService = require("../CRUDService/UserService.js");

const projectsList = process.env.PROJECTS;
const agreementsList = process.env.AGREEMENTS;
const requestsList = process.env.REQUESTS;
const offersList = process.env.OFFERS;

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

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
                if (req.body.isActiveAgreement) projectToUpdate.isActiveAgreement = req.body.isActiveAgreement;

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
            // console.log(projectList);
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
            // console.log(updatedProjects);
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
        else if (project.projectStatus === "RequestDeliberation" && isDatetimePassed(project.requestEndTime)) {
            const upvotes = await voteService.countVotesByRankPolicy(
                { policyURL: project.projectPolicies.requests[0].URL, rank: 1 },
                appSession);
            const membersNumber = await userService.getMemberCount(project.requestEndTime.toISOString(), appSession);
            const requestResult = upvotes >= Math.ceil(project.threshold * membersNumber);
            // UPDATING THe PROJECT STATUS
            if (requestResult === false && project.projectPolicies.offers.length !== 0) {
                project.projectStatus = "OfferDeliberation";
            }
            else if (requestResult === false && project.projectPolicies.offers.length === 0) {
                project.projectStatus = "Closed";
            }
            else {
                project.projectStatus = "AdminApprovalNeeded";
            }
            updatedProject = await projectService.updateProject({ projectURL: project.URL, status: project.projectStatus }, appSession);
        }
        else if (project.projectStatus === "OfferDeliberation" && isDatetimePassed(project.offerEndTime)) {
            const membersNumber = await userService.getMemberCount(project.offerEndTime.toISOString(), appSession);
            const cutoff = Math.ceil(project.threshold * membersNumber);
            const projectOffers = project.projectPolicies.offers.map(offer => offer.URL);
            let results = [];
            let winner = `rejection`;
            for (const offer of projectOffers) {
                const firstPreference = await voteService.countVotesByRankPolicy(
                    { policyURL: offer, rank: 1 },
                    appSession);
                results.push({ policyUrl: offer, count: firstPreference });
            }
            const rejectVote = await voteService.countVotesByRankPolicy({ policyURL: `${offersList}#rejection`, rank: 1 }, appSession);
            results.push({ policyUrl: `${offersList}#rejection`, count: rejectVote });
            const sortedResults = results.sort((a, b) => b.count - a.count);
            if (sortedResults[0].count > cutoff) {
                winner = sortedResults[0].policyUrl.split('#')[1];
            }
            project.projectStatus = "Closed";
            if (winner !== "rejection") {
                project.projectStatus = "ThirdPartyApprovalNeeded";
            }
            updatedProject = await projectService.updateProject({ projectURL: project.URL, status: project.projectStatus }, appSession);
        }
        if (project.hasAgreement === true) {
            if (isDatetimePassed(project.projectPolicies.agreements[0].untilTimeDuration)) {
                project.isActiveAgreement = false;
                updatedProject = await projectService.updateProject({ projectURL: project.URL, isActiveAgreement }, appSession);
                removeAccess(project.creator, appSession);
            }
        }

        return project;
    }

    return router;
};