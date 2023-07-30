require("dotenv").config();
const router = require("express").Router();
const policyService = require("../CRUDService/PolicyService.js");
const { Project } = require("../Models/Project.js");

const projectsList = process.env.PROJECTS;

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
                if (req.body.agreement) projectToUpdate.agreement = req.body.agreement;

                updatedProject = await policyService.updateProject(projectToUpdate, appSession);

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
            const projectURLs = await policyService.getProjects(appSession);
            let projects = [];
            for (const projectURL of projectURLs) {
                const fetchedProject = new Project();
                const project = await fetchedProject.fetchProject(projectURL, appSession);
                projects.push(fetchedProject.toJson());
            }
            res.send({ data: projects });
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