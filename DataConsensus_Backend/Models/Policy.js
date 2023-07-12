const policyService = require("../CRUDService/PolicyService.js");
const { DCTERMS } = require("@inrupt/vocab-common-rdf");

const policy = process.env.POLICY;
const odrl = "http://www.w3.org/ns/odrl/2/"

class Policy {
    constructor(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration) {
        this.id = id;
        this.creator = creator;
        this.issued = issued;
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
    }

    getPolicy() {
        return this;
    }

    setPolicy(id, creator, issued, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration) {
        this.id = id;
        this.creator = creator;
        this.issued = issued;
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
    }
}

class Agreement extends Policy {
    constructor(id, creator, issued, partOf, references, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration) {
        super(id, creator, issued, partOf, references, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration);
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

        this.uid = solidThing.predicates[`${odrl}/uid`]["namedNodes"][0];
        this.creator = solidThing.predicates[`http://purl.org/dc/terms/creator`]["namedNodes"][0];
        this.issued = solidThing.predicates[`http://purl.org/dc/terms/issued`]["literals"]["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.isPartOf = solidThing.predicates[`http://purl.org/dc/terms/isPartOf`]["namedNodes"][0];
        this.assigner = permissionThing.predicates[`http://purl.org/dc/terms/assigner`]["namedNodes"][0];
        this.assignee = permissionThing.predicates[`http://purl.org/dc/terms/assignee`]["namedNodes"][0];
        this.references = solidThing.predicates[`http://purl.org/dc/terms/references`]["namedNodes"][0];

        this.purpose = purposeConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
        if (sellingDataConstraint.predicates[`${odrl}/operator`]["namedNodes"].length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[`${odrl}/operator`]["namedNodes"].length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        this.sellingInsights = sellingInsights;
        this.organisation = organisationConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
        this.techOrgMeasures = techOrgMeasureConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
        this.recipients = recipientConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
        this.untilTimeDuration = durationConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
    }
}

class Offer extends Policy {
    constructor(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus) {
        super(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus);
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

        this.uid = solidThing.predicates[`${odrl}/uid`]["namedNodes"][0];
        this.creator = solidThing.predicates[`http://purl.org/dc/terms/creator`]["namedNodes"][0];
        this.issued = solidThing.predicates[`http://purl.org/dc/terms/issued`]["literals"]["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.isPartOf = solidThing.predicates[`http://purl.org/dc/terms/isPartOf`]["namedNodes"][0];
        this.assigner = permissionThing.predicates[`http://purl.org/dc/terms/assigner`]["namedNodes"][0];
        this.assignee = permissionThing.predicates[`http://purl.org/dc/terms/assignee`]["namedNodes"][0];
        this.adminApproved = solidThing.predicates[`${policy}/adminApproved`]["namedNodes"][0];
        this.memberApproved = solidThing.predicates[`${policy}/memberApproved`]["namedNodes"][0];
        this.thirdPartyApproved = solidThing.predicates[`${policy}/thirdPartyApproved`]["namedNodes"][0];

        this.purpose = purposeConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
        if (sellingDataConstraint.predicates[`${odrl}/operator`]["namedNodes"].length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[`${odrl}/operator`]["namedNodes"].length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        this.sellingInsights = sellingInsights;
        this.organisation = organisationConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
        this.techOrgMeasures = techOrgMeasureConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"];
        this.recipients = recipientConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"];
        this.untilTimeDuration = durationConstraint.predicates[`${odrl}/rightOperand`]["namedNodes"][0];
    }
}


class Request extends Policy {
    constructor(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus) {
        super(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus);
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

        this.uid = solidThing.predicates[`http://www.w3.org/ns/odrl/2/uid`]["namedNodes"][0];
        this.creator = solidThing.predicates[`http://purl.org/dc/terms/creator`]["namedNodes"][0];
        this.issued = solidThing.predicates[`http://purl.org/dc/terms/issued`]["literals"]["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.isPartOf = solidThing.predicates[`http://purl.org/dc/terms/isPartOf`]["namedNodes"][0];
        this.assigner = permissionThing.predicates[`http://www.w3.org/ns/odrl/2/assigner`]["namedNodes"][0];
        this.assignee = permissionThing.predicates[`http://www.w3.org/ns/odrl/2/assignee`]["namedNodes"][0];
        this.adminApproved = solidThing.predicates[`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schemas/policy#adminApproved`]["namedNodes"][0];
        this.memberApproved = solidThing.predicates[`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schemas/policy#memberApproved`]["namedNodes"][0];
        this.thirdPartyApproved = solidThing.predicates[`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schemas/policy#thirdPartyApproved`]["namedNodes"][0];

        this.purpose = purposeConstraint.predicates[`http://www.w3.org/ns/odrl/2/rightOperand`]["namedNodes"][0];
        if (sellingDataConstraint.predicates[`http://www.w3.org/ns/odrl/2/operator`]["namedNodes"][0] == "isNotA") {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[`http://www.w3.org/ns/odrl/2/operator`]["namedNodes"][0] == "isNotA") {
            this.sellingInsights = false;
        } else {
            this.sellingInsights = true;
        }
        this.organisation = organisationConstraint.predicates[`http://www.w3.org/ns/odrl/2/rightOperand`]["namedNodes"][0];
        this.techOrgMeasures = techOrgMeasureConstraint.predicates[`http://www.w3.org/ns/odrl/2/rightOperand`]["namedNodes"];
        this.recipients = recipientConstraint.predicates[`http://www.w3.org/ns/odrl/2/rightOperand`]["namedNodes"];
        this.untilTimeDuration = durationConstraint.predicates[`http://www.w3.org/ns/odrl/2/rightOperand`]["literals"]["http://www.w3.org/2001/XMLSchema#date"][0];
    }

    toJson() {
        return {
            uid: this.uid,
            creator: this.creator,
            issued: this.issued,
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
            untilTimeDuration: this.untilTimeDuration
        };
    }
}


module.exports = { Policy, Agreement, Request, Offer };