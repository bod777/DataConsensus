class Policy {
    constructor(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, jurisdiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold) {
        this.URL = URL;
        this.ID = ID;
        this.creator = creator;
        this.policyCreationTime = policyCreationTime;
        this.isPartOf = isPartOf;
        this.assigner = assigner;
        this.assignee = assignee;
        this.hasJustification = hasJustification;
        this.hasConsequence = hasConsequence;
        this.thirdPartyApproved = thirdPartyStatus;
        this.memberApproved = memberStatus;
        this.adminApproved = adminStatus;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.techOrgMeasures = techOrgMeasures;
        this.recipients = recipients;
        this.recipientsJustification = recipientsJustification;
        this.untilTimeDuration = untilTimeDuration;
        this.durationJustification = durationJustification;
        this.jurisdiction = jurisdiction;
        this.thirdCountry = thirdCountry;
        this.thirdCountryJustification = thirdCountryJustification;
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

    setPolicy(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, jurisdiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold) {
        this.URL = URL;
        this.ID = ID;
        this.creator = creator;
        this.policyCreationTime = policyCreationTime;
        this.partOf = isPartOf;
        this.assigner = assigner;
        this.assignee = assignee;
        this.hasJustification = hasJustification;
        this.hasConsequence = hasConsequence;
        this.thirdPartyApproved = thirdPartyStatus;
        this.memberApproved = memberStatus;
        this.adminApproved = adminStatus;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.techOrgMeasures = techOrgMeasures;
        this.recipients = recipients;
        this.recipientsJustification = recipientsJustification;
        this.untilTimeDuration = untilTimeDuration;
        this.durationJustification = durationJustification;
        this.jurisdiction = jurisdiction;
        this.thirdCountry = thirdCountry;
        this.thirdCountryJustification = thirdCountryJustification;
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

    toJson() {
        const policy = {
            URL: this.URL,
            ID: this.ID,
            creator: this.creator,
            policyCreationTime: new Date(this.policyCreationTime),
            isPartOf: this.isPartOf,
            assigner: this.assigner,
            assignee: this.assignee,
            hasJustification: this.hasJustification,
            hasConsequence: this.hasConsequence,
            adminApproved: this.adminApproved,
            memberApproved: this.memberApproved,
            thirdPartyApproved: this.thirdPartyApproved,
            purpose: this.purpose,
            sellingData: this.sellingData,
            sellingInsights: this.sellingInsights,
            organisation: this.organisation,
            techOrgMeasures: this.techOrgMeasures,
            recipients: this.recipients,
            recipientsJustification: this.recipientsJustification,
            untilTimeDuration: new Date(this.untilTimeDuration),
            durationJustification: this.durationJustification,
            jurisdiction: this.jurisdiction,
            thirdCountry: this.thirdCountry,
            thirdCountryJustification: this.thirdCountryJustification,
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
        return policy;
    }
}

class Agreement extends Policy {
    constructor(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, jurisdiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold, references) {
        super(URL, ID, creator, policyCreationTime, isPartOf, assigner, assignee, hasJustification, hasConsequence, purpose, sellingData, sellingInsights, organisation, techOrgMeasures, recipients, recipientsJustification, untilTimeDuration, durationJustification, jurisdiction, thirdCountry, thirdCountryJustification, thirdPartyStatus, memberStatus, adminStatus, title, description, projectStatus, hasAgreement, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold,);
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
            hasJustification: this.hasJustification,
            hasConsequence: this.hasConsequence,
            adminApproved: this.adminApproved,
            memberApproved: this.memberApproved,
            thirdPartyApproved: this.thirdPartyApproved,
            purpose: this.purpose,
            sellingData: this.sellingData,
            sellingInsights: this.sellingInsights,
            organisation: this.organisation,
            techOrgMeasures: this.techOrgMeasures,
            recipients: this.recipients,
            recipientsJustification: this.recipientsJustification,
            untilTimeDuration: new Date(this.untilTimeDuration),
            durationJustification: this.durationJustification,
            jurisdiction: this.jurisdiction,
            thirdCountry: this.thirdCountry,
            thirdCountryJustification: this.thirdCountryJustification,
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

module.exports = { Policy, Agreement };