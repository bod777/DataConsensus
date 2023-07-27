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
const { RDF, DCTERMS, ODRL } = require("@inrupt/vocab-common-rdf");
const userService = require("./UserService.js")
const { getDatasetUrl, getPolicyDataset } = require("../HelperFunctions.js");

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

    getPolicy: async function (req, session) {
        let datasetURL = getDatasetUrl(req.type);
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policy = await getThing(solidDataset, req.policyURL);
        return policy;
    },

    getProject: async function (projectURL, session) {
        let datasetURL = projectsList;
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policy = await getThing(solidDataset, projectURL);
        return policy;
    },

    getpolicyURLs: async function (policyType, session) {
        let datasetURL = getDatasetUrl(policyType);
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policies = await getThingAll(solidDataset);

        const policyURLs = await policies
            .filter((policy) => getUrl(policy, RDF.type) === `${odrl}${policyType}`);

        let urlList = policyURLs.map(item => item.url);

        return urlList;
    },

    createPolicy: async function (req, session) {
        let datasetURL = getDatasetUrl(req.type);
        let creator = req.creator;
        let assigner = req.assigner;
        let assignee = req.assignee;
        let purpose = req.purpose;
        let sellingData = req.sellingData;
        let sellingInsights = req.sellingInsights;
        let organisation = req.organisation;
        let techOrgMeasures = req.measures;
        let recipients = req.recipients;
        let untilTimeDuration = req.untilTimeDuration;
        let project = req.project;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policyID = uuidv4();
        const policyURL = `${datasetURL}#${policyID}`;

        const organisationConstraint = buildThing(createThing({ url: `${policyURL}_organisationConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addUrl(ODRL.leftOperand, `${oac}Organisation`)
            .addUrl(ODRL.operator, ODRL.isA)
            .addUrl(ODRL.rightOperand, `${dpv}${organisation}`)
            .build();

        const durationConstraint = buildThing(createThing({ url: `${policyURL}_durationConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addUrl(ODRL.leftOperand, `${dpv}UntilTimeDuration`)
            .addUrl(ODRL.operator, ODRL.eq)
            .addDatetime(ODRL.rightOperand, new Date(untilTimeDuration))
            .build();

        const purposeConstraint = buildThing(createThing({ url: `${policyURL}_purposeConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addUrl(ODRL.leftOperand, `${oac}Purpose`)
            .addUrl(ODRL.operator, ODRL.isA)
            .addUrl(ODRL.rightOperand, `${dpv}${purpose}`)
            .build();

        solidDataset = setThing(solidDataset, organisationConstraint);
        solidDataset = setThing(solidDataset, durationConstraint);
        solidDataset = setThing(solidDataset, purposeConstraint);

        let sellingDataConstraint = buildThing(createThing({ url: `${policyURL}_sellingDataConstraint` }))
        if (sellingData === true) {
            sellingDataConstraint = sellingDataConstraint
                .addUrl(RDF.type, ODRL.Constraint)
                .addUrl(ODRL.leftOperand, `${oac}Purpose`)
                .addUrl(ODRL.operator, ODRL.isA)
                .addUrl(ODRL.rightOperand, `${dpv}SellDataToThirdParties`);
        }
        else {
            sellingDataConstraint = sellingDataConstraint
                .addUrl(RDF.type, ODRL.Constraint)
                .addUrl(ODRL.leftOperand, `${oac}Purpose`)
                .addUrl(ODRL.operator, `${oac}isNotA`)
                .addUrl(ODRL.rightOperand, `${dpv}SellDataToThirdParties`);
        }
        sellingDataConstraint = sellingDataConstraint.build();
        solidDataset = setThing(solidDataset, sellingDataConstraint);

        let sellingInsightsConstraint = buildThing(createThing({ url: `${policyURL}_sellingInsightsConstraint` }))
        if (sellingInsights === true) {
            sellingInsightsConstraint = sellingInsightsConstraint
                .addUrl(RDF.type, ODRL.Constraint)
                .addUrl(ODRL.leftOperand, `${oac}Purpose`)
                .addUrl(ODRL.operator, ODRL.isA)
                .addUrl(ODRL.rightOperand, `${dpv}SellInsightsFromData`);
        }
        else {
            sellingInsightsConstraint = sellingInsightsConstraint
                .addUrl(RDF.type, ODRL.Constraint)
                .addUrl(ODRL.leftOperand, `${oac}Purpose`)
                .addUrl(ODRL.operator, `${oac}isNotA`)
                .addUrl(ODRL.rightOperand, `${dpv}SellInsightsFromData`);
        }
        sellingInsightsConstraint = sellingInsightsConstraint.build();
        solidDataset = setThing(solidDataset, sellingInsightsConstraint);

        if (techOrgMeasures.length > 0) {
            let techOrgMeasureConstraint = buildThing(createThing({ url: `${policyURL}_techOrgMeasureConstraint` }))
                .addUrl(RDF.type, ODRL.Constraint)
                .addUrl(ODRL.leftOperand, `${oac}TechnicalOrganisationalMeasure`)
                .addUrl(ODRL.operator, ODRL.isAllOf);

            techOrgMeasures.forEach((measure) => {
                techOrgMeasureConstraint = techOrgMeasureConstraint.addUrl(ODRL.rightOperand, `${dpv}${measure}`);
            });

            techOrgMeasureConstraint = techOrgMeasureConstraint.build();
            solidDataset = setThing(solidDataset, techOrgMeasureConstraint);
        }
        if (recipients.length > 0) {
            let recipientConstraint = buildThing(createThing({ url: `${policyURL}_recipientConstraint` }))
                .addUrl(RDF.type, ODRL.Constraint)
                .addUrl(ODRL.leftOperand, `${oac}Recipient`)
                .addUrl(ODRL.operator, ODRL.isAllOf);

            recipients.forEach((item) => {
                recipientConstraint = recipientConstraint.addUrl(ODRL.rightOperand, item);
            });
            recipientConstraint = recipientConstraint.build();
            solidDataset = setThing(solidDataset, recipientConstraint);
        }
        const newPermission = buildThing(createThing({ url: `${policyURL}_permission` }))
            .addUrl(RDF.type, ODRL.Permission)
            .addUrl(ODRL.assigner, assigner)
            .addUrl(ODRL.assignee, assignee)
            .addUrl(ODRL.action, `${dpv}Use`)
            .addUrl(ODRL.action, `${dpv}Transform`)
            .addUrl(ODRL.action, `${dpv}Copy`)
            .addUrl(ODRL.action, `${dpv}Store`)
            .addUrl(ODRL.action, `${dpv}Remove`)
            .addUrl(ODRL.target, `https://w3id.org/dpv/dpv-pd#MedicalHealth`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_organisationConstraint`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_durationConstraint`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_purposeConstraint`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_sellingDataConstraint`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_sellingInsightsConstraint`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_techOrgMeasureConstraint`)
            .addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_recipientConstraint`)
            .build();

        solidDataset = setThing(solidDataset, newPermission);

        let newPolicy = buildThing(createThing({ url: `${policyURL}` }))
            .addUrl(RDF.type, `${odrl}${req.type}`)
            .addUrl(DCTERMS.creator, creator)
            .addDatetime(DCTERMS.issued, new Date())
            .addUrl(DCTERMS.isPartOf, project)
            .addUrl(ODRL.uid, `${datasetURL}#${policyID}`)
            .addUrl(ODRL.profile, `${oac}`)
            .addUrl(ODRL.permission, `${datasetURL}#${policyID}_permission`);

        if (req.type == "Request" || req.type == "Offer") {
            let thirdPartyApproved = req.thirdPartyApproved;
            let memberApproved = req.memberApproved;
            let adminApproved = req.adminApproved;
            newPolicy = newPolicy
                .addUrl(`${policySchema}#thirdPartyApproved`, `${policySchema}#${thirdPartyApproved}`)
                .addUrl(`${policySchema}#memberApproved`, `${policySchema}#${memberApproved}`)
                .addUrl(`${policySchema}#adminApproved`, `${policySchema}#${adminApproved}`);
        }
        else {
            newPolicy = newPolicy
                .addUrl(DCTERMS.references, req.references)
                .addUrl(`${dpv}hasDataSubject`, `${req.assigner}`)
                .addUrl(`${dpv}hasJointDataController`, `${req.assignee}`)
                .addUrl(`${dpv}hasJointDataController`, `${req.assigner}`)
                .addUrl(`${dpv}hasLegalBasis`, `${dpv}Consent`);
        }

        newPolicy = newPolicy.build();
        solidDataset = setThing(solidDataset, newPolicy);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
        return policyURL;
    },

    updatePolicyStatus: async function (req, session) {
        let datasetURL = getPolicyDataset(req.policyURL);
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        let policyToUpdate = getThing(solidDataset, req.policyURL);
        newThing = buildThing(policyToUpdate)
            .setUrl(`${policySchema}#${req.actor}`, `${policySchema}#${req.newStatus}`)
            .build();

        solidDataset = setThing(solidDataset, newThing);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
        return policyToUpdate;
    },

    removeProposal: async function (req, session) {
        const webID = req.requester;
        const policyURL = req.policyURL;
        const datasetURL = getPolicyDataset(policyURL); l
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policy = getThing(solidDataset, policyURL);
        const permissionThing = getThing(solidDataset, `${policyURL}_permission`);
        const purposeConstraint = getThing(solidDataset, `${policyURL}_purposeConstraint`);
        const sellingDataConstraint = getThing(solidDataset, `${policyURL}_sellingDataConstraint`);
        const sellingInsightsConstraint = getThing(solidDataset, `${policyURL}_sellingInsightsConstraint`);
        const techOrgMeasureConstraint = getThing(solidDataset, `${policyURL}_techOrgMeasureConstraint`);
        const recipientConstraint = getThing(solidDataset, `${policyURL}_recipientConstraint`);
        const organisationConstraint = getThing(solidDataset, `${policyURL}_organisationConstraint`);
        const durationConstraint = getThing(solidDataset, `${policyURL}_durationConstraint`);
        if (policy === null) {
            throw new Error("Policy not found.");
        }
        else {
            // only the creator of the policy or an admin can delete it and only if the memberApproved is Pending
            const isAdmin = await userService.checkUserByType({ type: "ADMIN", webID }, session);
            if (webID === getUrl(policy, DCTERMS.creator) || isAdmin) {
                if (policy.memberApproved === `${policySchema}#Pending`) {
                    if (datasetURL === requestsList) {
                        this.updateProject({ projectURL: policy.project, status: "Completed" }, session);
                    }
                    solidDataset = removeThing(solidDataset, policy);
                    solidDataset = removeThing(solidDataset, permissionThing);
                    solidDataset = removeThing(solidDataset, purposeConstraint);
                    solidDataset = removeThing(solidDataset, sellingDataConstraint);
                    solidDataset = removeThing(solidDataset, sellingInsightsConstraint);
                    solidDataset = removeThing(solidDataset, techOrgMeasureConstraint);
                    solidDataset = removeThing(solidDataset, recipientConstraint);
                    solidDataset = removeThing(solidDataset, organisationConstraint);
                    solidDataset = removeThing(solidDataset, durationConstraint);
                    await saveGivenSolidDataset(datasetURL, solidDataset, session);

                }
            }
            else {
                throw new Error("You are not allowed to delete this policy.");
            }
        }
    },

    removeAgreement: async function (policyURL, session) {
        const datasetURL = agreementsList
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        const policy = getThing(solidDataset, policyURL);
        const permissionThing = getThing(solidDataset, `${policyURL}_permission`);
        const purposeConstraint = getThing(solidDataset, `${policyURL}_purposeConstraint`);
        const sellingDataConstraint = getThing(solidDataset, `${policyURL}_sellingDataConstraint`);
        const sellingInsightsConstraint = getThing(solidDataset, `${policyURL}_sellingInsightsConstraint`);
        const techOrgMeasureConstraint = getThing(solidDataset, `${policyURL}_techOrgMeasureConstraint`);
        const recipientConstraint = getThing(solidDataset, `${policyURL}_recipientConstraint`);
        const organisationConstraint = getThing(solidDataset, `${policyURL}_organisationConstraint`);
        const durationConstraint = getThing(solidDataset, `${policyURL}_durationConstraint`);

        const projectURL = getUrl(policy, DCTERMS.isPartOf);
        const referenceURL = getUrl(policy, DCTERMS.references);
        const thirdparty = getUrl(permissionThing, ODRL.assignee);
        if (referenceURL !== null) {
            // console.log("dct:reference:", referenceURL);
            let req = {
                policyURL: referenceURL,
                actor: "adminApproved",
                newStatus: "Removed"
            };
            await this.updatePolicyStatus(req, session);
        }
        if (projectURL !== null) {
            // console.log("projectURL:", projectURL);
            await this.updateProject({ projectURL, agreement: false }, session);
        }

        solidDataset = removeThing(solidDataset, policy);
        solidDataset = removeThing(solidDataset, permissionThing);
        solidDataset = removeThing(solidDataset, purposeConstraint);
        solidDataset = removeThing(solidDataset, sellingDataConstraint);
        solidDataset = removeThing(solidDataset, sellingInsightsConstraint);
        solidDataset = removeThing(solidDataset, techOrgMeasureConstraint);
        solidDataset = removeThing(solidDataset, recipientConstraint);
        solidDataset = removeThing(solidDataset, organisationConstraint);
        solidDataset = removeThing(solidDataset, durationConstraint);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);

        return thirdparty;
    },

    /* PROJECT RELATED FUNCTIONS */

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
            .addDatetime(`${projectSchema}#requestStartTime`, deliberationStartTime)
            .addDatetime(`${projectSchema}#requestEndTime`, requestEndTime)
            .addDatetime(`${projectSchema}#offerEndTime`, offerEndTime)
            .addDecimal(`${projectSchema}#threshold`, 0.5)
            .addBoolean(`${projectSchema}#hasAgreement`, false)
            .build();



        solidDataset = setThing(solidDataset, newProject);
        await saveGivenSolidDataset(projectsList, solidDataset, session);
        return `${projectsList}#${projectID}`;
    },

    updateProject: async function (req, session) {
        let solidDataset = await getGivenSolidDataset(projectsList, session);

        let projectToUpdate = getThing(solidDataset, req.projectURL);
        if (projectToUpdate) {
            if (req.status) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setUrl(`${projectSchema}#hasProjectStatus`, `${projectSchema}#${req.status}`)
                    .build();
            }
            if (req.title) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setStringNoLocale(DCTERMS.title, req.title)
                    .build();
            }
            if (req.description) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setStringNoLocale(DCTERMS.description, req.description).build();
            }
            if (req.requestStartTime) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setInteger(`${projectSchema}#requestStartTime`, req.startTime).build();
            }
            if (req.requestEndTime) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setInteger(`${projectSchema}#requestEndTime`, req.requestTime).build();
            }
            if (req.offerEndTime) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setInteger(`${projectSchema}#offerEndTime`, req.offerTime).build();
            }
            if (req.threshold) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setDecimal(`${projectSchema}#threshold`, req.threshold).build();
            }
            if (req.agreememt) {
                projectToUpdate = buildThing(projectToUpdate)
                    .setBoolean(`${projectSchema}#hasAgreement`, req.agreememt).build();
            }
            solidDataset = setThing(solidDataset, projectToUpdate);
            await saveGivenSolidDataset(projectsList, solidDataset, session);
            return projectToUpdate;
        }
        else {
            throw new Error("Project not found.");
        }
    },

    getPendingThirdPartyPolicies: async function () {

    },

    getPendingAdminPolicies: async function () {

    },


    getProjects: async function (session) {
        const solidDataset = await getGivenSolidDataset(projectsList, session);
        const projects = getThingAll(solidDataset);
        let projectList = projects.map(item => item.url);
        return projectList;
    },

    getProjectPolicies: async function (projectURL, session) {
        const requestDataset = await getGivenSolidDataset(requestsList, session);
        const requests = getThingAll(requestDataset, projectURL);
        let projectRequests = requests.filter((request) => getUrl(request, DCTERMS.isPartOf) === projectURL);
        projectRequests = projectRequests.map((request) => request.url);
        const offerDataset = await getGivenSolidDataset(offersList, session);
        const offers = getThingAll(offerDataset, projectURL);
        let projectOffers = offers.filter((offer) => getUrl(offer, DCTERMS.isPartOf) === projectURL);
        projectOffers = projectOffers.map((offer) => offer.url);
        const agreementDataset = await getGivenSolidDataset(agreementsList, session);
        const agreements = getThingAll(agreementDataset, projectURL);
        let projectAgreements = agreements.filter((agreement) => getUrl(agreement, DCTERMS.isPartOf) === projectURL);
        projectAgreements = projectAgreements.map((agreement) => agreement.url);
        return { requests: projectRequests, offers: projectOffers, agreements: projectAgreements };
    }
}