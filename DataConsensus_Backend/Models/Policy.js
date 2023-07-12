const service = require("../CRUDService.js");
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
        this.references = references; // Only for agreements
    }

    fetchPolicy(URL) {
        const solidThing = service.getPolicy(`${URL}`);
        const permissionThing = service.getPolicy(`${URL}_permission`);
        const purposeConstraint = service.getPolicy(`${URL}_purposeConstraint`);
        const sellingDataConstraint = service.getPolicy(`${URL}_sellingDataConstraint`);
        const sellingInsightsConstraint = service.getPolicy(`${URL}_sellingInsightsConstraint`);
        const organisationConstraint = service.getPolicy(`${URL}_organisationConstraint`);
        const techOrgMeasureConstraint = service.getPolicy(`${URL}_techOrgMeasureConstraint`);
        const recipientConstraint = service.getPolicy(`${URL}_recipientConstraint`);
        const durationConstraint = service.getPolicy(`${URL}_durationConstraint`);

        this.uid = solidThing.predicates[`${odrl}/uid`].namedNodes[0];
        this.creator = solidThing.predicates[DCTERMS.creator].namedNodes[0];
        this.issued = solidThing.predicates[DCTERMS.issued].literals["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.isPartOf = solidThing.predicates[DCTERMS.isPartOf].namedNodes[0];
        this.assigner = permissionThing.predicates[DCTERMS.assigner].namedNodes[0];
        this.assignee = permissionThing.predicates[DCTERMS.assignee].namedNodes[0];
        this.references = solidThing.predicates[DCTERMS.references].namedNodes[0];

        this.purpose = purposeConstraint.predicates[`${odrl}/rightOperand`].namedNodes[0];
        if (sellingDataConstraint.predicates[`${odrl}/operator`].namedNodes.length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[`${odrl}/operator`].namedNodes.length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        this.sellingInsights = sellingInsights;
        this.organisation = organisationConstraint.predicates[`${odrl}/rightOperand`].namedNodes[0];
        this.techOrgMeasures = techOrgMeasureConstraint.predicates[`${odrl}/rightOperand`].namedNodes;
        this.recipients = recipientConstraint.predicates[`${odrl}/rightOperand`].namedNodes;
        this.untilTimeDuration = durationConstraint.predicates[`${odrl}/rightOperand`].namedNodes[0];
    }
}

class Proposal extends Policy {
    constructor(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus) {
        super(id, creator, issued, partOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus);
        this.thirdPartyApproved = thirdPartyStatus; // Only for offers or requests
        this.memberApproved = memberStatus; // Only for offers or requests
        this.adminApproved = adminStatus; // Only for offers or requests
    }

    fetchPolicy(URL) {
        const solidThing = service.getPolicy(`${URL}`);
        const permissionThing = service.getPolicy(`${URL}_permission`);
        const purposeConstraint = service.getPolicy(`${URL}_purposeConstraint`);
        const sellingDataConstraint = service.getPolicy(`${URL}_sellingDataConstraint`);
        const sellingInsightsConstraint = service.getPolicy(`${URL}_sellingInsightsConstraint`);
        const organisationConstraint = service.getPolicy(`${URL}_organisationConstraint`);
        const techOrgMeasureConstraint = service.getPolicy(`${URL}_techOrgMeasureConstraint`);
        const recipientConstraint = service.getPolicy(`${URL}_recipientConstraint`);
        const durationConstraint = service.getPolicy(`${URL}_durationConstraint`);

        this.uid = solidThing.predicates[`${odrl}/uid`].namedNodes[0];
        this.creator = solidThing.predicates[DCTERMS.creator].namedNodes[0];
        this.issued = solidThing.predicates[DCTERMS.issued].literals["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.isPartOf = solidThing.predicates[DCTERMS.isPartOf].namedNodes[0];
        this.assigner = permissionThing.predicates[DCTERMS.assigner].namedNodes[0];
        this.assignee = permissionThing.predicates[DCTERMS.assignee].namedNodes[0];
        this.adminApproved = solidThing.predicates[`${policy}/adminApproved`].namedNodes[0];
        this.memberApproved = solidThing.predicates[`${policy}/memberApproved`].namedNodes[0];
        this.thirdPartyApproved = solidThing.predicates[`${policy}/thirdPartyApproved`].namedNodes[0];

        this.purpose = purposeConstraint.predicates[`${odrl}/rightOperand`].namedNodes[0];
        if (sellingDataConstraint.predicates[`${odrl}/operator`].namedNodes.length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        if (sellingInsightsConstraint.predicates[`${odrl}/operator`].namedNodes.length == isNotA) {
            this.sellingData = false;
        } else {
            this.sellingData = true;
        }
        this.sellingInsights = sellingInsights;
        this.organisation = organisationConstraint.predicates[`${odrl}/rightOperand`].namedNodes[0];
        this.techOrgMeasures = techOrgMeasureConstraint.predicates[`${odrl}/rightOperand`].namedNodes;
        this.recipients = recipientConstraint.predicates[`${odrl}/rightOperand`].namedNodes;
        this.untilTimeDuration = durationConstraint.predicates[`${odrl}/rightOperand`].namedNodes[0];
    }
}

module.exports = { Policy, Agreement, Proposal };
