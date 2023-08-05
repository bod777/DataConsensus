require("dotenv").config();
const {
    buildThing,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getThingAll,
    getUrl,
    getBoolean,
    addDatetime,
    removeThing,
    setInteger,
    setDecimal,
    setUrl,
    setBoolean,
    setStringNoLocale,
    getSolidDataset
} = require("@inrupt/solid-client");
const { v4: uuidv4 } = require('uuid');
const { RDF, DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const { Project } = require("../Models/Project.js");
const { extractTerm, getDataset } = require("../HelperFunctions.js");

const policy = process.env.POLICY;
const project = process.env.PROJECT;
const policySchema = process.env.POLICY;
const projectSchema = process.env.PROJECT;
const agreementsList = process.env.AGREEMENTS
const offersList = process.env.OFFERS
const projectsList = process.env.PROJECTS
const requestsList = process.env.REQUESTS
const odrl = process.env.ODRL
const dpv = process.env.DPV
const oac = process.env.OAC

async function getGivenSolidDataset(datasetURL, session) {
    return await getSolidDataset(datasetURL, { fetch: session.fetch });
}

async function saveGivenSolidDataset(datasetURL, courseSolidDataset, session) {
    await saveSolidDatasetAt(
        datasetURL,
        courseSolidDataset,
        { fetch: session.fetch }
    );
}

module.exports = {

    getSolidThing: async function (URL, session) {
        let datasetURL = getDataset(URL);
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policy = await getThing(solidDataset, URL);
        return policy;
    },

    getProject: async function (projectURL, session) {
        const projectThing = await this.getSolidThing(projectURL, session);
        const projectRequests = await this.getRelatedPolicies(projectThing, requestsList, session);
        const projectOffers = await this.getRelatedPolicies(projectThing, offersList, session);
        const projectAgreements = await this.getRelatedPolicies(projectThing, agreementsList, session);
        const projectPolicies = { requests: projectRequests, offers: projectOffers, agreements: projectAgreements };
        const project = await this.formatProject(projectThing, projectPolicies, session);
        return project;
    },

    formatProject: async function (projectThing, projectPolicies, session) {
        const projectURL = projectThing.url;
        const projectID = projectThing.url.split('#')[1];
        const creator = projectThing.predicates[DCTERMS.creator]["namedNodes"][0];
        const organisation = extractTerm(projectThing.predicates[`${oac}Organisation`]["namedNodes"][0]);
        const title = projectThing.predicates[DCTERMS.title]["literals"][XSD.string][0];
        const description = projectThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        const projectStatus = extractTerm(projectThing.predicates[`${projectSchema}#hasProjectStatus`]["namedNodes"][0]);
        const hasAgreement = projectThing.predicates[`${projectSchema}#hasAgreement`]["literals"][XSD.boolean][0];
        const hasAccess = projectThing.predicates[`${projectSchema}#hasAccess`]["literals"][XSD.boolean][0];
        const projectCreationTime = projectThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        const requestStartTime = projectThing.predicates[`${projectSchema}#requestStartTime`]["literals"][XSD.dateTime][0];
        const requestEndTime = projectThing.predicates[`${projectSchema}#requestEndTime`]["literals"][XSD.dateTime][0];
        const offerEndTime = projectThing.predicates[`${projectSchema}#offerEndTime`]["literals"][XSD.dateTime][0];
        const threshold = projectThing.predicates[`${projectSchema}#threshold`]["literals"][XSD.decimal][0];

        const project = new Project(projectURL, projectID, creator, title, description, organisation, projectStatus, hasAgreement, hasAccess, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold, projectPolicies);
        return project.toJson();
    },

    getProjects: async function (session) {
        const solidDataset = await getGivenSolidDataset(projectsList, session);
        const projects = getThingAll(solidDataset);
        let projectPromises = projects.map(async item => {
            const projectRequests = await this.getRelatedPolicies(item, requestsList, session);
            const projectOffers = await this.getRelatedPolicies(item, offersList, session);
            const projectAgreements = await this.getRelatedPolicies(item, agreementsList, session);
            const projectPolicies = { requests: projectRequests, offers: projectOffers, agreements: projectAgreements };
            const project = await this.formatProject(item, projectPolicies, session);

            return project;
        });
        const projectList = await Promise.all(projectPromises);
        return projectList;
    },

    getRelatedPolicies: async function (project, dataset, session) {
        const policyService = require("../CRUDService/PolicyService.js");
        // console.log("Project ", project.url);
        const policyDataset = await getGivenSolidDataset(dataset, session);
        // console.log("Policy Dataset ", policyDataset);
        const policies = getThingAll(policyDataset);
        // console.log("Policies ", policies)
        let projectPolicies = [];
        let policySolidThings = policies.filter((policy) => getUrl(policy, DCTERMS.isPartOf) === project.url);
        // console.log("Policy Solid Things", policySolidThings);
        policyURLs = policySolidThings.map((policy) => policy.url);
        // console.log("Policy URLs", policyURLs);
        // const filteredPolicies = policies.filter(obj => policyURLs.includes(obj.url));
        const filteredPolicies = policies.filter(obj => policyURLs.some(url => (obj.url.includes(url))));
        // console.log("Filtered Policies", filteredPolicies);
        for (const URL of policyURLs) {
            // console.log("For loop URL", URL);
            const solidThing = filteredPolicies.find(obj => obj.url === `${URL}`);
            const permissionThing = filteredPolicies.find(obj => obj.url === `${URL}_permission`);
            const purposeConstraint = filteredPolicies.find(obj => obj.url === `${URL}_purposeConstraint`);
            const sellingDataConstraint = filteredPolicies.find(obj => obj.url === `${URL}_sellingDataConstraint`);
            const sellingInsightsConstraint = filteredPolicies.find(obj => obj.url === `${URL}_sellingInsightsConstraint`);
            const organisationConstraint = filteredPolicies.find(obj => obj.url === `${URL}_organisationConstraint`);
            const techOrgMeasureConstraint = filteredPolicies.find(obj => obj.url === `${URL}_techOrgMeasureConstraint`);
            const recipientConstraint = filteredPolicies.find(obj => obj.url === `${URL}_recipientConstraint`);
            const durationConstraint = filteredPolicies.find(obj => obj.url === `${URL}_durationConstraint`);
            const jurisdictionConstraint = filteredPolicies.find(obj => obj.url === `${URL}_jurisdictionConstraint`);
            const thirdCountryConstraint = filteredPolicies.find(obj => obj.url === `${URL}_thirdCountryConstraint`);

            // console.log("Duration ", durationConstraint);
            let policy;
            if (dataset !== agreementsList) {
                policy = await policyService.formatProposal(solidThing, permissionThing, purposeConstraint, sellingDataConstraint, sellingInsightsConstraint, organisationConstraint, techOrgMeasureConstraint, recipientConstraint, durationConstraint, jurisdictionConstraint, thirdCountryConstraint, project);
            }
            else {
                policy = await policyService.formatAgreement(solidThing, permissionThing, purposeConstraint, sellingDataConstraint, sellingInsightsConstraint, organisationConstraint, techOrgMeasureConstraint, recipientConstraint, durationConstraint, jurisdictionConstraint, thirdCountryConstraint, project);
            }
            // console.log("formated policy", policy);
            projectPolicies.push(policy);
        }
        // console.log("project policies", projectPolicies);
        return projectPolicies;
    },

    createProject: async function (req, session) {
        let solidDataset = await getGivenSolidDataset(projectsList, session);
        const projectID = uuidv4();
        const projectURL = `${projectsList}#${projectID}`;
        const currentTime = new Date();
        const requestStartTime = new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000);
        const requestEndTime = new Date(requestStartTime.getTime() + 7 * 24 * 60 * 60 * 1000);
        const offerEndTime = new Date(requestEndTime.getTime() + 7 * 24 * 60 * 60 * 1000);
        const newProject = buildThing(createThing({ url: projectURL }))
            .addUrl(RDF.type, `${projectSchema}#Project`)
            .addUrl(`${projectSchema}#hasProjectStatus`, `${projectSchema}#Pending`)
            .addStringNoLocale(DCTERMS.title, req.title)
            .addStringNoLocale(DCTERMS.description, req.description)
            .addUrl(`${oac}Organisation`, `${dpv}${req.organisation}`)
            .addUrl(DCTERMS.creator, req.creator)
            .addDatetime(DCTERMS.issued, currentTime)
            .addDatetime(`${projectSchema}#requestStartTime`, requestStartTime)
            .addDatetime(`${projectSchema}#requestEndTime`, requestEndTime)
            .addDatetime(`${projectSchema}#offerEndTime`, offerEndTime)
            .addDecimal(`${projectSchema}#threshold`, 0.5)
            .addBoolean(`${projectSchema}#hasAgreement`, false)
            .addBoolean(`${projectSchema}#hasAccess`, false)
            .build();

        solidDataset = setThing(solidDataset, newProject);
        await saveGivenSolidDataset(projectsList, solidDataset, session);
        return `${projectsList}#${projectID}`;
    },

    updateProject: async function (req, session) {
        let solidDataset = await getGivenSolidDataset(projectsList, session);
        let projectToUpdate = getThing(solidDataset, req.projectURL);
        if (projectToUpdate) {
            if (req.status !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setUrl(`${projectSchema}#hasProjectStatus`, `${projectSchema}#${req.status}`)
                    .build();
            }
            if (req.title !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setStringNoLocale(DCTERMS.title, req.title)
                    .build();
            }
            if (req.description !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setStringNoLocale(DCTERMS.description, req.description).build();
            }
            if (req.requestStartTime !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setDatetime(`${projectSchema}#requestStartTime`, new Date(req.requestStartTime)).build();
            }
            if (req.requestEndTime !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setDatetime(`${projectSchema}#requestEndTime`, new Date(req.requestEndTime)).build();
            }
            if (req.offerEndTime !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setDatetime(`${projectSchema}#offerEndTime`, new Date(req.offerEndTime)).build();
            }
            if (req.threshold !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setDecimal(`${projectSchema}#threshold`, req.threshold).build();
            }
            if (req.hasAgreement !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setBoolean(`${projectSchema}#hasAgreement`, req.hasAgreement).build();
            }
            if (req.hasAccess !== undefined) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setBoolean(`${projectSchema}#hasAccess`, req.hasAccess).build();
            }
            solidDataset = setThing(solidDataset, projectToUpdate);
            await saveGivenSolidDataset(projectsList, solidDataset, session);
            return projectToUpdate;
        }
        else {
            throw new Error("Project not found.");
        }
    },
}