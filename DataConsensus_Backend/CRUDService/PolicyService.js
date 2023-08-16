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
const userService = require("./UserService.js")
const { Policy, Agreement } = require("../Models/Policy.js");
const { ODRL, DCTERMS, XSD, RDF } = require("@inrupt/vocab-common-rdf");
const { extractTerm, getDatasetUrl, getDataset, getPolicyType } = require("../HelperFunctions.js");
const projectService = require("./ProjectService.js");
const { grantAccess, removeAccess } = require("../AccessControl.js");

const resource = process.env.RESOURCE_URL;
const ocp = process.env.OCP;
const projectSchema = process.env.PROJECT;
const agreementsList = process.env.AGREEMENTS
const offersList = process.env.OFFERS
const projectsList = process.env.PROJECTS
const requestsList = process.env.REQUESTS
const odrl = process.env.ODRL
const dpv = process.env.DPV
const dpvlegal = process.env.DPVLEGAL
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

    getSolidThing: async function (req, session) {
        let datasetURL = getDataset(req.policyURL);
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policy = await getThing(solidDataset, req.policyURL);
        return policy;
    },

    fetchPolicy: async function (URL, session) {
        const solidThing = await this.getSolidThing({ policyURL: `${URL}` }, session);
        const permissionThing = await this.getSolidThing({ policyURL: `${URL}_permission` }, session);
        const purposeConstraint = await this.getSolidThing({ policyURL: `${URL}_purposeConstraint` }, session);
        const sellingDataConstraint = await this.getSolidThing({ policyURL: `${URL}_sellingDataConstraint` }, session);
        const sellingInsightsConstraint = await this.getSolidThing({ policyURL: `${URL}_sellingInsightsConstraint` }, session);
        const organisationConstraint = await this.getSolidThing({ policyURL: `${URL}_organisationConstraint` }, session);
        const techOrgMeasureConstraint = await this.getSolidThing({ policyURL: `${URL}_techOrgMeasureConstraint` }, session);
        const recipientConstraint = await this.getSolidThing({ policyURL: `${URL}_recipientConstraint` }, session);
        const durationConstraint = await this.getSolidThing({ policyURL: `${URL}_durationConstraint` }, session);
        const jurisdictionConstraint = await this.getSolidThing({ policyURL: `${URL}_jurisdictionConstraint` }, session);
        const thirdCountryConstraint = await this.getSolidThing({ policyURL: `${URL}_thirdCountryConstraint` }, session);
        const projectThing = await this.getSolidThing({ policyURL: solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0] }, session);

        let policy;
        if (getPolicyType(URL) === "AGREEMENT") {
            const { URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, juridiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold } = await this.formatPolicy(solidThing, permissionThing, purposeConstraint, sellingDataConstraint, sellingInsightsConstraint, organisationConstraint, techOrgMeasureConstraint, recipientConstraint, durationConstraint, jurisdictionConstraint, thirdCountryConstraint, projectThing);
            const references = solidThing.predicates[DCTERMS.references]["namedNodes"][0];
            const agreement = new Agreement(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, juridiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold, references);
            policy = agreement.toJson();
        } else {
            const { URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, juridiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold } = await this.formatPolicy(solidThing, permissionThing, purposeConstraint, sellingDataConstraint, sellingInsightsConstraint, organisationConstraint, techOrgMeasureConstraint, recipientConstraint, durationConstraint, jurisdictionConstraint, thirdCountryConstraint, projectThing);
            const proposal = new Policy(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, juridiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold);
            policy = proposal.toJson();
        }
        return policy;
    },

    formatPolicy: async function (solidThing, permissionThing, purposeConstraint, sellingDataConstraint, sellingInsightsConstraint, organisationConstraint, techOrgMeasureConstraint, recipientConstraint, durationConstraint, jurisdictionConstraint, thirdCountryConstraint, projectThing) {
        const URL = solidThing.url;
        const ID = solidThing.url.split('#')[1];
        const creator = solidThing.predicates[DCTERMS.creator]["namedNodes"][0];
        const policyCreationTime = extractTerm(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
        const isPartOf = solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0];
        const assigner = permissionThing.predicates[ODRL.assigner]["namedNodes"][0];
        const assignee = permissionThing.predicates[ODRL.assignee]["namedNodes"][0];
        const adminStatus = extractTerm(solidThing.predicates[`${ocp}#adminApproved`]["namedNodes"][0]);
        const memberStatus = extractTerm(solidThing.predicates[`${ocp}#memberApproved`]["namedNodes"][0]);
        const thirdPartyStatus = extractTerm(solidThing.predicates[`${ocp}#thirdPartyApproved`]["namedNodes"][0]);
        const hasJustification = solidThing.predicates[`${ocp}#hasJustification`]["literals"][XSD.string][0];
        const hasConsequence = solidThing.predicates[`${ocp}#hasConsequence`]["literals"][XSD.string][0];

        const purpose = extractTerm(purposeConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        const organisation = extractTerm(organisationConstraint.predicates[ODRL.rightOperand]["namedNodes"][0])
        let sellingData;
        let sellingInsights;
        if (sellingDataConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            sellingData = false;
        } else {
            sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            sellingInsights = false;
        } else {
            sellingInsights = true;
        }
        const measuresArray = techOrgMeasureConstraint?.predicates?.[ODRL.rightOperand]?.["namedNodes"] || [];
        const techOrgMeasures = measuresArray.map((measure) => extractTerm(measure));
        const recipients = recipientConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        const recipientsJustification = recipientConstraint.predicates[`${ocp}#hasJustification`]["literals"][XSD.string][0];
        const untilTimeDuration = durationConstraint.predicates[ODRL.rightOperand]["literals"][XSD.dateTime][0];
        const durationJustification = durationConstraint.predicates[`${ocp}#hasJustification`]["literals"][XSD.string][0];
        const juridiction = extractTerm(jurisdictionConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        const thirdCountriesArray = thirdCountryConstraint?.predicates?.[ODRL.rightOperand]?.["namedNodes"] || [];
        let thirdCountry = thirdCountriesArray.map((country) => extractTerm(country));
        let thirdCountryJustification = thirdCountryConstraint?.predicates?.[`${ocp}#hasJustification`]?.["literals"]?.[XSD.string]?.[0] || "Data will remain in the State.";
        thirdCountryJustification = thirdCountryJustification === undefined ? "Data will remain in the State." : thirdCountryJustification;


        const title = projectThing.predicates[DCTERMS.title]["literals"][XSD.string][0];
        const description = projectThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        const projectStatus = extractTerm(projectThing.predicates[`${projectSchema}#hasProjectStatus`]["namedNodes"][0]);
        const hasAgreement = projectThing.predicates[`${projectSchema}#hasAgreement`]["literals"][XSD.boolean][0];
        const projectCreationTime = projectThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        const requestStartTime = projectThing.predicates[`${projectSchema}#requestStartTime`]["literals"][XSD.dateTime][0];
        const requestEndTime = projectThing.predicates[`${projectSchema}#requestEndTime`]["literals"][XSD.dateTime][0];
        const offerEndTime = projectThing.predicates[`${projectSchema}#offerEndTime`]["literals"][XSD.dateTime][0];
        const threshold = projectThing.predicates[`${projectSchema}#threshold`]["literals"][XSD.decimal][0];

        return { URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, juridiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold };
    },

    // FIX THIS
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
        let hasJustification = req.hasJustification;
        let hasConsequence = req.hasConsequence;
        let purpose = req.purpose;
        let sellingData = req.sellingData;
        let sellingInsights = req.sellingInsights;
        let organisation = req.organisation;
        let techOrgMeasures = req.measures;
        let recipients = req.recipients;
        let recipientsJustification = req.recipientsJustification;
        let untilTimeDuration = req.untilTimeDuration;
        let durationJustification = req.durationJustification;
        let juridiction = req.juridiction;
        let thirdCountry = req.thirdCountry;
        let thirdCountryJustification = req.thirdCountryJustification;
        let project = req.project;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const policyID = uuidv4();
        const policyURL = `${datasetURL}#${policyID}`;

        let newPolicy = buildThing(createThing({ url: `${policyURL}` }))
            .addUrl(RDF.type, `${odrl}${req.type}`)
            .addUrl(DCTERMS.creator, creator)
            .addDatetime(DCTERMS.issued, new Date())
            .addUrl(DCTERMS.isPartOf, project)
            .addUrl(ODRL.uid, `${datasetURL}#${policyID}`)
            .addStringNoLocale(`${ocp}#hasJustification`, hasJustification)
            .addStringNoLocale(`${ocp}#hasConsequence`, hasConsequence)
            .addUrl(ODRL.profile, ocp)
            .addUrl(ODRL.profile, oac)
            .addUrl(ODRL.permission, `${datasetURL}#${policyID}_permission`);

        if (req.type == "REQUEST" || req.type == "OFFER") {
            let thirdPartyApproved = req.thirdPartyApproved;
            let memberApproved = req.memberApproved;
            let adminApproved = req.adminApproved;
            newPolicy = newPolicy
                .addUrl(`${ocp}#thirdPartyApproved`, `${ocp}#${thirdPartyApproved}`)
                .addUrl(`${ocp}#memberApproved`, `${ocp}#${memberApproved}`)
                .addUrl(`${ocp}#adminApproved`, `${ocp}#${adminApproved}`);
        }
        else {
            newPolicy = newPolicy
                .addUrl(`${ocp}#thirdPartyApproved`, `${ocp}#Approved`)
                .addUrl(`${ocp}#memberApproved`, `${ocp}#Approved`)
                .addUrl(`${ocp}#adminApproved`, `${ocp}#Approved`)
                .addUrl(DCTERMS.references, req.references);
            const members = await userService.getWebIDs(session);
            for (const member of members) {
                newPolicy = newPolicy.addUrl(`${dpv}hasDataSubject`, member);
            };
            newPolicy = newPolicy.addUrl(`${dpv}hasJointDataController`, `${req.assignee}`)
                .addUrl(`${dpv}hasJointDataController`, `${req.assigner}`)
                .addUrl(`${dpv}hasLegalBasis`, `${dpv}Consent`);
        }

        newPolicy = newPolicy.build();
        solidDataset = setThing(solidDataset, newPolicy);

        let newPermission = buildThing(createThing({ url: `${policyURL}_permission` }))
            .addUrl(RDF.type, ODRL.Permission)
            .addUrl(ODRL.assigner, assigner)
            .addUrl(ODRL.assignee, assignee)
            .addUrl(ODRL.action, `${dpv}Use`)
            .addUrl(ODRL.action, `${dpv}Transform`)
            .addUrl(ODRL.action, `${dpv}Copy`)
            .addUrl(ODRL.action, `${dpv}Store`)
            .addUrl(ODRL.action, `${dpv}Remove`)
            .addUrl(ODRL.target, resource)
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

        if (techOrgMeasures.length > 0) {
            newPermission = newPermission.addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_techOrgMeasureConstraint`);
        }
        if (recipients.length > 0) {
            newPermission = newPermission.addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_recipientConstraint`);
        }
        newPermission = newPermission.addUrl(ODRL.constraint,
            `${datasetURL}#${policyID}_jurisdictionConstraint`)
        if (thirdCountry.length > 0) {
            newPermission = newPermission.addUrl(ODRL.constraint,
                `${datasetURL}#${policyID}_thirdCountryConstraint`)

        }
        newPermission = newPermission.build();
        solidDataset = setThing(solidDataset, newPermission);

        const purposeConstraint = buildThing(createThing({ url: `${policyURL}_purposeConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addUrl(ODRL.leftOperand, `${oac}Purpose`)
            .addUrl(ODRL.operator, ODRL.isA)
            .addUrl(ODRL.rightOperand, `${dpv}${purpose}`)
            .build();

        solidDataset = setThing(solidDataset, purposeConstraint);

        const organisationConstraint = buildThing(createThing({ url: `${policyURL}_organisationConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addUrl(ODRL.leftOperand, `${ocp}#Organisation`)
            .addUrl(ODRL.operator, ODRL.isA)
            .addUrl(ODRL.rightOperand, `${dpv}${organisation}`)
            .build();

        solidDataset = setThing(solidDataset, organisationConstraint);

        const jurisdictionConstraint = buildThing(createThing({ url: `${policyURL}_jurisdictionConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addUrl(ODRL.leftOperand, `${ocp}#hasJurisdiction`)
            .addUrl(ODRL.operator, ODRL.eq)
            .addUrl(ODRL.rightOperand, `${dpvlegal}${juridiction}`)
            .build();

        solidDataset = setThing(solidDataset, jurisdictionConstraint);

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
                .addUrl(ODRL.operator, `${ocp}#isAllOf`);
            techOrgMeasures.forEach((measure) => {
                techOrgMeasureConstraint = techOrgMeasureConstraint.addUrl(ODRL.rightOperand, `${dpv}${measure}`);
            });

            techOrgMeasureConstraint = techOrgMeasureConstraint.build();
            solidDataset = setThing(solidDataset, techOrgMeasureConstraint);
        }
        if (recipients.length > 0) {
            let recipientConstraint = buildThing(createThing({ url: `${policyURL}_recipientConstraint` }))
                .addUrl(RDF.type, ODRL.Constraint)
                .addStringNoLocale(`${ocp}#hasJustification`, recipientsJustification)
                .addUrl(ODRL.leftOperand, `${oac}Recipient`)
                .addUrl(ODRL.operator, `${ocp}#isAllOf`)

            recipients.forEach((item) => {
                recipientConstraint = recipientConstraint.addUrl(ODRL.rightOperand, item);
            });
            recipientConstraint = recipientConstraint.build();
            solidDataset = setThing(solidDataset, recipientConstraint);
        }

        const durationConstraint = buildThing(createThing({ url: `${policyURL}_durationConstraint` }))
            .addUrl(RDF.type, ODRL.Constraint)
            .addStringNoLocale(`${ocp}#hasJustification`, durationJustification)
            .addUrl(ODRL.leftOperand, `${ocp}#UntilTimeDuration`)
            .addUrl(ODRL.operator, ODRL.eq)
            .addDatetime(ODRL.rightOperand, new Date(untilTimeDuration))
            .build();

        solidDataset = setThing(solidDataset, durationConstraint);

        if (thirdCountry.length > 0) {
            let thirdCountryConstraint = buildThing(createThing({ url: `${policyURL}_thirdCountryConstraint` }))
                .addUrl(RDF.type, ODRL.Constraint)
                .addStringNoLocale(`${ocp}#hasJustification`, thirdCountryJustification)
                .addUrl(ODRL.leftOperand, `${ocp}#ThirdCountry`)
                .addUrl(ODRL.operator, `${ocp}#isAllOf`)

            thirdCountry.forEach((item) => {
                thirdCountryConstraint = thirdCountryConstraint.addUrl(ODRL.rightOperand, `${dpvlegal}${item}`);
            });
            thirdCountryConstraint = thirdCountryConstraint.build();
            solidDataset = setThing(solidDataset, thirdCountryConstraint);
        }


        await saveGivenSolidDataset(datasetURL, solidDataset, session);
        return policyURL;
    },

    updatePolicyStatus: async function (req, session) {
        let datasetURL = getDataset(req.policyURL);
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        let policyToUpdate = getThing(solidDataset, req.policyURL);
        newThing = buildThing(policyToUpdate)
            .setUrl(`${ocp}#${req.actor}`, `${ocp}#${req.newStatus}`)
            .build();
        solidDataset = setThing(solidDataset, newThing);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
        return policyToUpdate;
    },

    removeProposal: async function (req, session) {
        const webID = req.requester;
        const policyURL = req.policyURL;
        const datasetURL = getDataset(policyURL);
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
        const jurisdictionConstraint = getThing(solidDataset, `${policyURL}_jurisdictionConstraint`);
        const thirdCountryConstraint = getThing(solidDataset, `${policyURL}_thirdCountryConstraint`);
        if (policy === null) {
            throw new Error("Policy not found.");
        }
        else {
            // only the creator of the policy or an admin can delete it and only if the memberApproved is Pending
            const isAdmin = await userService.checkUserByType({ type: "ADMIN", webID }, session);
            if (webID === getUrl(policy, DCTERMS.creator) || isAdmin) {
                if (getUrl(policy, `${ocp}#memberApproved`) === `${ocp}#Pending`) {
                    if (datasetURL === requestsList) {
                        await projectService.updateProject({ projectURL: getUrl(policy, DCTERMS.isPartOf), status: "Removed" }, session);
                    }
                    solidDataset = removeThing(solidDataset, policy);
                    solidDataset = removeThing(solidDataset, permissionThing);
                    solidDataset = removeThing(solidDataset, purposeConstraint);
                    solidDataset = removeThing(solidDataset, sellingDataConstraint);
                    solidDataset = removeThing(solidDataset, sellingInsightsConstraint);
                    if (techOrgMeasureConstraint !== null) {
                        solidDataset = removeThing(solidDataset, techOrgMeasureConstraint);
                    }
                    solidDataset = removeThing(solidDataset, recipientConstraint);
                    solidDataset = removeThing(solidDataset, organisationConstraint);
                    solidDataset = removeThing(solidDataset, durationConstraint);
                    solidDataset = removeThing(solidDataset, jurisdictionConstraint);
                    if (thirdCountryConstraint !== null) {
                        solidDataset = removeThing(solidDataset, thirdCountryConstraint);
                    }
                    await saveGivenSolidDataset(datasetURL, solidDataset, session);
                }
            }
            else {
                throw new Error("You are not allowed to delete this policy.");
            }
        }
    },
}