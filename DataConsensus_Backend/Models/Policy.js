class Policy {
    constructor(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold) {
        this.URL = URL;
        this.ID = ID;
        this.creator = creator;
        this.policyCreationTime = policyCreationTime;
        this.isPartOf = isPartOf;
        this.assigner = assigner;
        this.assignee = assignee;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.techOrgMeasures = techOrgMeasures;
        this.recipients = recipients;
        this.untilTimeDuration = untilTimeDuration;
        this.title = title;
        this.description = description;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.projectCreationTime = projectCreationTime;
        this.requestStartTime = requestStartTime;
        this.requestEndTime = requestEndTime;
        this.offerEndTime = offerEndTime;
        this.threshold = threshold;
    }

    setPolicy(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold) {
        this.URL = URL;
        this.ID = ID;
        this.creator = creator;
        this.policyCreationTime = policyCreationTime;
        this.partOf = isPartOf;
        this.assigner = assigner;
        this.assignee = assignee;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.techOrgMeasures = techOrgMeasures;
        this.recipients = recipients;
        this.untilTimeDuration = untilTimeDuration;
        this.title = title;
        this.description = description;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.projectCreationTime = projectCreationTime;
        this.requestStartTime = requestStartTime;
        this.requestEndTime = requestEndTime;
        this.offerEndTime = offerEndTime;
        this.threshold = threshold;
    }
}

class Agreement extends Policy {
    constructor(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, untilTimeDuration, references, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold) {
        super(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold);
        this.references = references;
    }

    toJson() {
        return {
            URL: this.URL,
            ID: this.ID,
            creator: this.creator,
            policyCreationTime: new Date(this.policyCreationTime),
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
            untilTimeDuration: new Date(this.untilTimeDuration),
            title: this.title,
            description: this.description,
            projectStatus: this.projectStatus,
            hasAgreement: (this.hasAgreement === 'true' ? true : false),
            projectCreationTime: new Date(this.projectCreationTime),
            requestStartTime: new Date(this.requestStartTime),
            requestEndTime: new Date(this.requestEndTime),
            offerEndTime: new Date(this.offerEndTime),
            threshold: this.threshold
        };
    }
}

class Proposal extends Policy {
    constructor(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold) {
        super(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, untilTimeDuration, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold);
        this.thirdPartyApproved = thirdPartyStatus;
        this.memberApproved = memberStatus;
        this.adminApproved = adminStatus;
    }

    toJson() {
        return {
            URL: this.URL,
            ID: this.ID,
            creator: this.creator,
            policyCreationTime: new Date(this.policyCreationTime),
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
            untilTimeDuration: new Date(this.untilTimeDuration),
            title: this.title,
            description: this.description,
            projectStatus: this.projectStatus,
            hasAgreement: (this.hasAgreement === 'true' ? true : false),
            projectCreationTime: new Date(this.projectCreationTime),
            requestStartTime: new Date(this.requestStartTime),
            requestEndTime: new Date(this.requestEndTime),
            offerEndTime: new Date(this.offerEndTime),
            threshold: this.threshold
        };
    }
}

module.exports = { Policy, Agreement, Proposal };