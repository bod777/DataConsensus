const policyService = require("../CRUDService/PolicyService.js");
const { ODRL, DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const { extractTerm } = require("../HelperFunctions.js");

const policy = process.env.POLICY;
const project = process.env.PROJECT;
const odrl = process.env.ODRL;
const oac = process.env.OAC;

class Policy {
    constructor(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType) {
        this.id = id;
        this.creator = creator;
        this.policyCreationTime = policyCreationTime;
        this.partOf = partOf;
        this.assigner = assigner;
        this.assignee = assignee;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.technicalMeasures = technicalMeasures;
        this.organisationalMeasures = organisationalMeasures;
        this.recipients = recipients;
        this.untilTimeDuration = untilTimeDuration;
        this.title = title;
        this.description = description;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.projectCreationTime = projectCreationTime;
        this.deliberationStartTime = deliberationStartTime;
        this.requestTime = requestTime;
        this.offerTime = offerTime;
        this.threshold = threshold;
        this.thresholdType = thresholdType;
    }

    getPolicy() {
        return this;
    }

    setPolicy(id, creator, policyCreationTime, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType) {
        this.id = id;
        this.creator = creator;
        this.policyCreationTime = policyCreationTime;
        this.partOf = partOf;
        this.assigner = assigner;
        this.assignee = assignee;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.technicalMeasures = technicalMeasures;
        this.organisationalMeasures = organisationalMeasures;
        this.recipients = recipients;
        this.untilTimeDuration = untilTimeDuration;
        this.title = title;
        this.description = description;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.projectCreationTime = projectCreationTime;
        this.deliberationStartTime = deliberationStartTime;
        this.requestTime = requestTime;
        this.offerTime = offerTime;
        this.threshold = threshold;
        this.thresholdType = thresholdType;
    }
}

class Agreement extends Policy {
    constructor(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, references, thresholdType) {
        super(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType);
        this.references = references;
    }

    async fetchPolicy(URL, session) {
        const solidThing = await policyService.getPolicy({ policyURL: `${URL}`, type: "Agreement" }, session);
        const permissionThing = await policyService.getPolicy({ policyURL: `${URL}_permission`, type: "Agreement" }, session);
        const purposeConstraint = await policyService.getPolicy({ policyURL: `${URL}_purposeConstraint`, type: "Agreement" }, session);
        const sellingDataConstraint = await policyService.getPolicy({ policyURL: `${URL}_sellingDataConstraint`, type: "Agreement" }, session);
        const sellingInsightsConstraint = await policyService.getPolicy({ policyURL: `${URL}_sellingInsightsConstraint`, type: "Agreement" }, session);
        const organisationConstraint = await policyService.getPolicy({ policyURL: `${URL}_organisationConstraint`, type: "Agreement" }, session);
        const techOrgMeasureConstraint = await policyService.getPolicy({ policyURL: `${URL}_techOrgMeasureConstraint`, type: "Agreement" }, session);
        const recipientConstraint = await policyService.getPolicy({ policyURL: `${URL}_recipientConstraint`, type: "Agreement" }, session);
        const durationConstraint = await policyService.getPolicy({ policyURL: `${URL}_durationConstraint`, type: "Agreement" }, session);

        this.uid = solidThing.predicates[ODRL.uid]["namedNodes"][0];
        this.creator = solidThing.predicates[DCTERMS.creator]["namedNodes"][0];
        this.policyCreationTime = extractTerm(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
        this.isPartOf = solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0];
        this.assigner = permissionThing.predicates[ODRL.assigner]["namedNodes"][0];
        this.assignee = permissionThing.predicates[ODRL.assignee]["namedNodes"][0];
        this.references = solidThing.predicates[DCTERMS.references]["namedNodes"][0];

        this.purpose = extractTerm(purposeConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        this.organisation = extractTerm(organisationConstraint.predicates[ODRL.rightOperand]["namedNodes"][0])
        if (sellingDataConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            this.sellingInsights = false;
        } else {
            this.sellingInsights = true;
        }
        const measuresArray = techOrgMeasureConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        this.techOrgMeasures = measuresArray.map((measure) => extractTerm(measure));
        const recipientsArray = recipientConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        this.recipients = recipientsArray.map((recipient) => extractTerm(recipient));
        this.untilTimeDuration = durationConstraint.predicates[ODRL.rightOperand]["literals"][XSD.dateTime][0];

        const projectThing = await policyService.getProject(solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0], session);
        this.title = projectThing.predicates[DCTERMS.title]["literals"][XSD.string][0];
        this.description = projectThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        this.projectStatus = extractTerm(projectThing.predicates[`${project}#hasProjectStatus`]["namedNodes"][0]);
        this.hasAgreement = projectThing.predicates[`${project}#hasAgreement`]["literals"][XSD.boolean][0];
        this.projectCreationTime = projectThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.deliberationStartTime = projectThing.predicates[`${project}#deliberationStartTime`]["literals"][XSD.dateTime][0];
        this.requestTime = projectThing.predicates[`${project}#requestTime`]["literals"][XSD.integer][0];
        this.offerTime = projectThing.predicates[`${project}#offerTime`]["literals"][XSD.integer][0];
        this.threshold = projectThing.predicates[`${project}#threshold`]["literals"][XSD.decimal][0];
        this.thresholdType = extractTerm(projectThing.predicates[`${project}#thresholdType`]["namedNodes"][0]);
    }

    toJson() {
        return {
            uid: this.uid,
            creator: this.creator,
            policyCreationTime: this.policyCreationTime,
            isPartOf: this.isPartOf,
            assigner: this.assigner,
            assignee: this.assignee,
            references: this.references,
            purpose: this.purpose,
            sellingData: this.sellingData,
            sellingInsights: this.sellingInsights,
            organisation: this.organisation,
            techOrgMeasures: this.techOrgMeasures,
            recipients: this.recipients,
            untilTimeDuration: this.untilTimeDuration,
            title: this.title,
            description: this.description,
            projectStatus: this.projectStatus,
            hasAgreement: this.hasAgreement,
            projectCreationTime: this.projectCreationTime,
            deliberationStartTime: this.deliberationStartTime,
            requestTime: this.requestTime,
            offerTime: this.offerTime,
            threshold: this.threshold,
            thresholdType: this.thresholdType
        };
    }
}

class Offer extends Policy {
    constructor(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType) {
        super(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType);
        this.thirdPartyApproved = thirdPartyStatus;
        this.memberApproved = memberStatus;
        this.adminApproved = adminStatus;
    }

    async fetchPolicy(URL, session) {
        const solidThing = await policyService.getPolicy({ policyURL: `${URL}`, type: "Offer" }, session);
        const permissionThing = await policyService.getPolicy({ policyURL: `${URL}_permission`, type: "Offer" }, session);
        const purposeConstraint = await policyService.getPolicy({ policyURL: `${URL}_purposeConstraint`, type: "Offer" }, session);
        const sellingDataConstraint = await policyService.getPolicy({ policyURL: `${URL}_sellingDataConstraint`, type: "Offer" }, session);
        const sellingInsightsConstraint = await policyService.getPolicy({ policyURL: `${URL}_sellingInsightsConstraint`, type: "Offer" }, session);
        const organisationConstraint = await policyService.getPolicy({ policyURL: `${URL}_organisationConstraint`, type: "Offer" }, session);
        const techOrgMeasureConstraint = await policyService.getPolicy({ policyURL: `${URL}_techOrgMeasureConstraint`, type: "Offer" }, session);
        const recipientConstraint = await policyService.getPolicy({ policyURL: `${URL}_recipientConstraint`, type: "Offer" }, session);
        const durationConstraint = await policyService.getPolicy({ policyURL: `${URL}_durationConstraint`, type: "Offer" }, session);

        this.uid = extractTerm(solidThing.predicates[ODRL.uid]["namedNodes"][0]);
        this.creator = extractTerm(solidThing.predicates[DCTERMS.creator]["namedNodes"][0]);
        this.policyCreationTime = extractTerm(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
        this.isPartOf = extractTerm(solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0]);
        this.assigner = extractTerm(permissionThing.predicates[ODRL.assigner]["namedNodes"][0]);
        this.assignee = extractTerm(permissionThing.predicates[ODRL.assignee]["namedNodes"][0]);
        this.adminApproved = extractTerm(solidThing.predicates[`${policy}#adminApproved`]["namedNodes"][0]);
        this.memberApproved = extractTerm(solidThing.predicates[`${policy}#memberApproved`]["namedNodes"][0]);
        this.thirdPartyApproved = extractTerm(solidThing.predicates[`${policy}#thirdPartyApproved`]["namedNodes"][0]);

        this.purpose = extractTerm(purposeConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        if (sellingDataConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            this.sellingInsights = false;
        } else {
            this.sellingInsights = true;
        }
        this.organisation = extractTerm(organisationConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        const measuresArray = techOrgMeasureConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        this.techOrgMeasures = measuresArray.map((measure) => extractTerm(measure));
        const recipientsArray = recipientConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        this.recipients = recipientsArray.map((recipient) => extractTerm(recipient));
        this.untilTimeDuration = extractTerm(durationConstraint.predicates[ODRL.rightOperand]["literals"][XSD.dateTime][0]);

        const projectThing = await policyService.getProject(solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0], session);
        this.title = projectThing.predicates[DCTERMS.title]["literals"][XSD.string][0];
        this.description = projectThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        this.projectStatus = extractTerm(projectThing.predicates[`${project}#hasProjectStatus`]["namedNodes"][0]);
        this.hasAgreement = projectThing.predicates[`${project}#hasAgreement`]["literals"][XSD.boolean][0];
        this.projectCreationTime = projectThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.deliberationStartTime = projectThing.predicates[`${project}#deliberationStartTime`]["literals"][XSD.dateTime][0];
        this.requestTime = projectThing.predicates[`${project}#requestTime`]["literals"][XSD.integer][0];
        this.offerTime = projectThing.predicates[`${project}#offerTime`]["literals"][XSD.integer][0];
        this.threshold = projectThing.predicates[`${project}#threshold`]["literals"][XSD.decimal][0];
        this.thresholdType = extractTerm(projectThing.predicates[`${project}#thresholdType`]["namedNodes"][0]);
    }

    toJson() {
        return {
            uid: this.uid,
            creator: this.creator,
            policyCreationTime: this.policyCreationTime,
            isPartOf: this.isPartOf,
            assigner: this.assigner,
            assignee: this.assignee,
            adminApproved: this.adminApproved,
            memberApproved: this.memberApproved,
            thirdPartyApproved: this.thirdPartyApproved,
            purpose: this.purpose,
            sellingData: this.sellingData,
            sellingInsights: this.sellingInsights,
            organisation: this.organisation,
            techOrgMeasures: this.techOrgMeasures,
            recipients: this.recipients,
            untilTimeDuration: this.untilTimeDuration,
            title: this.title,
            description: this.description,
            projectStatus: this.projectStatus,
            hasAgreement: this.hasAgreement,
            projectCreationTime: this.projectCreationTime,
            deliberationStartTime: this.deliberationStartTime,
            requestTime: this.requestTime,
            offerTime: this.offerTime,
            threshold: this.threshold,
            thresholdType: this.thresholdType
        };
    }
}


class Request extends Policy {
    constructor(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType) {
        super(id, creator, policyCreationTime, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType);
        this.thirdPartyApproved = thirdPartyStatus;
        this.memberApproved = memberStatus;
        this.adminApproved = adminStatus;
    }

    async fetchPolicy(URL, session) {
        const solidThing = await policyService.getPolicy({ policyURL: `${URL}`, type: "Request" }, session);
        const permissionThing = await policyService.getPolicy({ policyURL: `${URL}_permission`, type: "Request" }, session);
        const purposeConstraint = await policyService.getPolicy({ policyURL: `${URL}_purposeConstraint`, type: "Request" }, session);
        const sellingDataConstraint = await policyService.getPolicy({ policyURL: `${URL}_sellingDataConstraint`, type: "Request" }, session);
        const sellingInsightsConstraint = await policyService.getPolicy({ policyURL: `${URL}_sellingInsightsConstraint`, type: "Request" }, session);
        const organisationConstraint = await policyService.getPolicy({ policyURL: `${URL}_organisationConstraint`, type: "Request" }, session);
        const techOrgMeasureConstraint = await policyService.getPolicy({ policyURL: `${URL}_techOrgMeasureConstraint`, type: "Request" }, session);
        const recipientConstraint = await policyService.getPolicy({ policyURL: `${URL}_recipientConstraint`, type: "Request" }, session);
        const durationConstraint = await policyService.getPolicy({ policyURL: `${URL}_durationConstraint`, type: "Request" }, session);

        this.uid = extractTerm(solidThing.predicates[ODRL.uid]["namedNodes"][0]);
        this.creator = solidThing.predicates[DCTERMS.creator]["namedNodes"][0];
        this.policyCreationTime = solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.isPartOf = extractTerm(solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0]);
        this.assigner = permissionThing.predicates[ODRL.assigner]["namedNodes"][0];
        this.assignee = permissionThing.predicates[ODRL.assignee]["namedNodes"][0];
        this.adminApproved = extractTerm(solidThing.predicates[`${policy}#adminApproved`]["namedNodes"][0]);
        this.memberApproved = extractTerm(solidThing.predicates[`${policy}#memberApproved`]["namedNodes"][0]);
        this.thirdPartyApproved = extractTerm(solidThing.predicates[`${policy}#thirdPartyApproved`]["namedNodes"][0]);
        this.purpose = extractTerm(purposeConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        if (sellingDataConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[ODRL.operator]["namedNodes"][0] === `${oac}isNotA`) {
            this.sellingInsights = false;
        } else {
            this.sellingInsights = true;
        }
        this.organisation = extractTerm(organisationConstraint.predicates[ODRL.rightOperand]["namedNodes"][0]);
        const measuresArray = techOrgMeasureConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        this.techOrgMeasures = measuresArray.map((measure) => extractTerm(measure));
        const recipientsArray = recipientConstraint.predicates[ODRL.rightOperand]["namedNodes"];
        this.recipients = recipientsArray.map((recipient) => extractTerm(recipient));
        this.untilTimeDuration = durationConstraint.predicates[ODRL.rightOperand]["literals"][XSD.dateTime][0];

        const projectThing = await policyService.getProject(solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0], session);
        console.log(projectThing);
        this.title = projectThing.predicates[DCTERMS.title]["literals"][XSD.string][0];
        this.description = projectThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        this.projectStatus = extractTerm(projectThing.predicates[`${project}#hasProjectStatus`]["namedNodes"][0]);
        this.hasAgreement = projectThing.predicates[`${project}#hasAgreement`]["literals"][XSD.boolean][0];
        this.projectCreationTime = projectThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.deliberationStartTime = projectThing.predicates[`${project}#deliberationStartTime`]["literals"][XSD.dateTime][0];
        this.requestTime = projectThing.predicates[`${project}#requestTime`]["literals"][XSD.integer][0];
        this.offerTime = projectThing.predicates[`${project}#offerTime`]["literals"][XSD.integer][0];
        this.threshold = projectThing.predicates[`${project}#threshold`]["literals"][XSD.decimal][0];
        this.thresholdType = extractTerm(projectThing.predicates[`${project}#thresholdType`]["namedNodes"][0]);
    }

    toJson() {
        const json = {
            uid: this.uid,
            creator: this.creator,
            policyCreationTime: this.policyCreationTime,
            isPartOf: this.isPartOf,
            assigner: this.assigner,
            assignee: this.assignee,
            adminApproved: this.adminApproved,
            memberApproved: this.memberApproved,
            thirdPartyApproved: this.thirdPartyApproved,
            purpose: this.purpose,
            sellingData: this.sellingData,
            sellingInsights: this.sellingInsights,
            organisation: this.organisation,
            techOrgMeasures: this.techOrgMeasures,
            recipients: this.recipients,
            untilTimeDuration: this.untilTimeDuration,
            title: this.title,
            description: this.description,
            projectStatus: this.projectStatus,
            hasAgreement: this.hasAgreement,
            projectCreationTime: this.projectCreationTime,
            deliberationStartTime: this.deliberationStartTime,
            requestTime: this.requestTime,
            offerTime: this.offerTime,
            threshold: this.threshold,
            thresholdType: this.thresholdType
        };
        return json;
    }
}


module.exports = { Policy, Agreement, Request, Offer };