require("dotenv").config();
const {
    buildThing,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getThingAll,
    getUrl,
    getSolidDataset
} = require("@inrupt/solid-client");
const { getSessionFromStorage } = require("@inrupt/solid-client-authn-node");
const { DCTERMS } = require("@inrupt/vocab-common-rdf");

const policy = process.env.POLICY;
const project = process.env.PROJECT;
const requestsURL = process.env.REQUESTS
const offersURL = process.env.OFFERS
const agreementsURL = process.env.AGREEMENTS
const projectsURL = process.env.PROJECTS
const dpv = "https://w3id.org/dpv#"
const odrl = "http://www.w3.org/ns/odrl/2/"
const oac = "https://w3id.org/oac/"

function getDatasetUrl(type) {
    let datasetURL;
    switch (type) {
        case 'Request':
            datasetURL = requestsURL;
            break;
        case 'Offer':
            datasetURL = offersURL;
            break;
        default:
            datasetURL = agreementsURL;
            break;
    }
    return datasetURL;
}

function getPolicyType(URL) {
    const segments = URL.split("/");
    const filename = segments[segments.length - 1];
    const policyType = filename.split(".")[0];
    return policyType;
}

function generateID(solidDataset) {
    let array = getThingAll(solidDataset);
    let ID = array.length + 2;
    return ID;
}

async function getGivenSolidDataset(datasetURL, session) {
    return await getSolidDataset(datasetURL, { fetch: session.fetch });
}

async function saveGivenSolidDataset(datasetURL, courseSolidDataset, session) {
    const savedSolidDataset = await saveSolidDatasetAt(
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

    getPolicyURLs: async function (req, session) {
        let datasetURL = getDatasetUrl(req.type);

        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policies = await getThingAll(solidDataset);

        const policyURLS = await policies
            .filter((policy) => getUrl(policy, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") === `http://www.w3.org/ns/odrl/2/${req.type}`);

        let justURLs = policyURLS.map(item => item.url);

        return justURLs;
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
        let techOrgMeasures = req.techOrgMeasures;
        let recipients = req.recipients;
        let untilTimeDuration = req.untilTimeDuration;
        let project = req.project;

        let measuresArray = [];
        techOrgMeasures.forEach(function (value) {
            if (value.completed) {
                measuresArray.push(value.name);
            }
        });
        let recipientsArray = [];
        recipients.forEach(function (value) {
            if (value.completed) {
                recipientsArray.push(value.name);
            }
        });

        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let policyID = generateID(solidDataset);

        const organisationConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_organisationConstraint` }))
            .addUrl(`${odrl}#leftOperand`, `${oac}#Organisation`)
            .addUrl(`${odrl}#operator`, `${odrl}#isA`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${organisation}`)
            .build();

        const durationConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_durationConstraint` }))
            .addUrl(`${odrl}#leftOperand`, `${dpv}#UntilTimeDuration`)
            .addUrl(`${odrl}#operator`, `${odrl}#eq`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${untilTimeDuration}`)
            .build();

        const purposeConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_purposeConstraint` }))
            .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
            .addUrl(`${odrl}#operator`, `${odrl}#isA`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${purpose}`)
            .build();

        solidDataset = setThing(solidDataset, organisationConstraint);
        solidDataset = setThing(solidDataset, durationConstraint);
        solidDataset = setThing(solidDataset, purposeConstraint);

        let sellingDataConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_sellingDataConstraint` }))
        if (sellingData) {
            sellingDataConstraint = sellingDataConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellDataToThirdParties}`);
        }
        else {
            sellingDataConstraint = sellingDataConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isNotA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellDataToThirdParties`);
        }
        sellingDataConstraint = sellingDataConstraint.build();
        solidDataset = setThing(solidDataset, sellingDataConstraint);

        let sellingInsightsConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_sellingInsightsConstraint` }))
        if (sellingInsights) {
            sellingInsightsConstraint = sellingInsightsConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellInsightsFromData`);
        }
        else {
            sellingInsightsConstraint = sellingInsightsConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isNotA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellInsightsFromData`);
        }
        sellingInsightsConstraint = sellingInsightsConstraint.build();
        solidDataset = setThing(solidDataset, sellingInsightsConstraint);

        if (measuresArray.length > 0) {
            let techOrgMeasureConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_techOrgMeasureConstraint` }))
                .addUrl(`${odrl}#leftOperand`, `${oac}#TechnicalOrganisationalMeasure`)
                .addUrl(`${odrl}#operator`, `${odrl}#isAllOf`)
                .addUrl(`${odrl}#rightOperand`, organisation)

            measuresArray.forEach((measure) => {
                techOrgMeasureConstraint = techOrgMeasureConstraint.addUrl(`${odrl}#rightOperand`, measure);
            });

            techOrgMeasureConstraint = techOrgMeasureConstraint.build();
            solidDataset = setThing(solidDataset, techOrgMeasureConstraint);
        }
        if (recipientsArray.length > 0) {
            let recipientConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_recipientConstraint` }))
                .addUrl(`${odrl}#leftOperand`, `${oac}#Recipient`)
                .addUrl(`${odrl}#operator`, `${odrl}#isAllOf`)
                .addUrl(`${odrl}#rightOperand`, recipientsArray)

            recipientsArray.forEach((item) => {
                recipientConstraint = recipientConstraint.addUrl(`${odrl}#rightOperand`, item);
            });
            recipientConstraint = recipientConstraint.build();
            solidDataset = setThing(solidDataset, recipientConstraint);
        }

        const newPermission = buildThing(createThing({ name: `${datasetURL}#${policyID}_permission` }))
            .addUrl(`${odrl}#assigner`, assigner)
            .addUrl(`${odrl}#assignee`, assignee)
            .addUrl(`${odrl}#action`, `${dpv}#Use`)
            .addUrl(`${odrl}#action`, `${dpv}#Transform`)
            .addUrl(`${odrl}#action`, `${dpv}#Copy`)
            .addUrl(`${odrl}#action`, `${dpv}#Store`)
            .addUrl(`${odrl}#action`, `${dpv}#Remove`)
            .addUrl(`${odrl}#target`, `https://w3id.org/dpv/dpv-pd#MedicalHealth`)
            .addUrl(`${odrl}#constraint`,
                `${datasetURL}#${policyID}_organisationConstraint`,
                `${datasetURL}#${policyID}_durationConstraint`,
                `${datasetURL}#${policyID}_purposeConstraint`,
                `${datasetURL}#${policyID}_sellingDataConstraint`,
                `${datasetURL}#${policyID}_sellingInsightsConstraint`,
                `${datasetURL}#${policyID}_techOrgMeasureConstraint`,
                `${datasetURL}#${policyID}_recipientConstraint`)
            .build();

        solidDataset = setThing(solidDataset, newPermission);

        let newPolicy = buildThing(createThing({ name: `${datasetURL}#${policyID}` }))
            .addUrl(rdf_type, `${odrl}#${req.type}`)
            .addUrl(DCTERMS.creator, creator)
            .addStringNoLocale(DCTERMS.issued, new Date())
            .addUrl(DCTERMS.isPartOf, `${projectsURL}#${project}`)
            .addUrl(`${odrl}#uid`, `${datasetURL}#${policyID}`)
            .addUrl(`${odrl}#profile`, `${oac}`)
            .addUrl(`${odrl}#permission`, `${datasetURL}#${policyID}_permission`);

        if (req.type == "Request" || req.type == "Offer") {
            let thirdPartyApproved = req.thirdPartyApproved;
            let memberApproved = req.memberApproved;
            let adminApproved = req.adminApproved;
            newPolicy = newPolicy
                .addUrl(`${policy}#thirdPartyApproved`, `${policy}#${thirdPartyApproved}`)
                .addUrl(`${policy}#memberApproved`, `${policy}#${memberApproved}`)
                .addUrl(`${policy}#adminApproved`, `${policy}#${adminApproved}`);
        }
        else {
            let references = req.references;
            newPolicy = newPolicy
                .addUrl(DCTERMS.references, references)
                .addUrl(`${dpv}#hasDataSubject`, `${dpv}#${req.assigner}`)
                .addUrl(`${dpv}#hasJointDataController`, `${dpv}#${req.assignee}`)
                .addUrl(`${dpv}#hasJointDataController`, `${dpv}#${req.assigner}`)
                .addUrl(`${dpv}#hasLegalBasis`, `${dpv}#Consent`);

            this.updateProject(req.project, session)
        }

        newPolicy = newPolicy.build();

        solidDataset = setThing(solidDataset, newPolicy);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    updatePolicyStatus: async function (req, session) {
        let datasetURL = getDatasetUrl(getPolicyType(req.policyURL));
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        let policyToUpdate = getThing(solidDataset, req.policyURL);
        policyToUpdate = setUrl(policyToUpdate, `${policy}#${req.actor}`, `${policy}#${req.newStatus}`);

        solidDataset = setThing(solidDataset, policyToUpdate);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);

    },

    removePolicy: async function (policyType, agreementID, session) {
        let datasetURL = getDatasetUrl(policyType);
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policy = getThing(solidDataset, datasetURL + "#" + agreementID);

        if (policy === null) {
            throw new Error("Policy not found.");
        }
        if (policyType === "agreement") {
            const referenceURL = getUrl(policy, `${dct}#references`);
            if (referenceURL === null) {
                throw new Error("dct:reference not found in the agreement.");
            }
            console.log("dct:reference:", referenceURL);
            let req = {
                type: getPolicyType(referenceURL),
                policyURL: referenceURL,
                actor: "adminApproved",
                newStatus: "Removed"
            };

            await updatePolicyStatus(req, session);
        }

        solidDataset = removeThing(solidDataset, policy);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    /* PROJECT RELATED FUNCTIONS */

    createProject: async function (req, session) {
        let solidDataset = await getGivenSolidDataset(projectsURL, session);
        let projectID = generateID(solidDataset);
        const newProject = createThing({ name: projectID })
            .addUrl(rdf.type, `${dct}#Project`)
            .addStringNoLocale(`${dct}#title`, req.title)
            .addStringNoLocale(`${dct}#description`, req.description)
            .addUrl(`${oac}#Organisation`, `${dpv}#${req.organisation}`)
            .addUrl(`${dct}#creator`, req.creator)
            .addInteger(`${project}#requestTime`, 7)
            .addInteger(`${project}#offerTime`, 7)
            .addInteger(`${project}#threshold`, 0.5)
            .addBoolean(`${project}#hasAgreement`, false)
            .build();

        solidDataset = setThing(solidDataset, newProject);
        await saveGivenSolidDataset(projectsURL, solidDataset, session);
        return projectID;
    },


    updateProject: async function (req, session) {
        let solidDataset = await getGivenSolidDataset(projectsURL, session);
        let projectToUpdate = getThing(solidDataset, req.projectURL);

        if (req.title) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${dct}#title`, req.title);
        }
        if (req.description) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${dct}#description`, req.description);
        }
        if (req.requestTime) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#requestTime`, req.requestTime);
        }
        if (req.offerTime) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#offerTime`, req.offerTime);
        }
        if (req.threshold) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#threshold`, req.threshold);
        }
        if (req.agreememt) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#hasAgreement`, true);
        }

        solidDataset = setThing(solidDataset, projectToUpdate);
        await saveGivenSolidDataset(projectsURL, solidDataset, session);
    },

    getProjectThreshold: async function (projectUrl, session) {
        const solidDataset = await getGivenSolidDataset(projectsURL, session);
        const projectThing = getThing(solidDataset, projectUrl);

        if (!projectThing) {
            throw new Error(`Project not found`);
        }

        const threshold = getDecimal(projectThing, `${project}#threshold`);
        if (threshold === null || threshold === undefined) {
            throw new Error(`Project ${projectUrl} does not have a threshold`);
        }

        return threshold;
    },

    getProjectOffers: async function (projectURL, session) {
        const solidDataset = await getGivenSolidDataset(offersURL, session);
        const allOffers = getThingAll(solidDataset);

        const relevantOffers = [];

        for (const offer of allOffers) {
            const isPartOf = getStringNoLocale(offer, DCTERMS.isPartOf);
            if (isPartOf === projectURL) {
                relevantOffers.push(offer);
            }
        }
        return relevantOffers;
    },
}