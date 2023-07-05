class Policy {
    constructor(id, creator, issued, description, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, thirdPartyStatus, memberStatus, adminStatus) {
        this.id = id; // Unique identifier for the policy 
        this.creator = creator; // ID of the user who created the policy
        this.issued = issued; // Timestamp when the policy was issued
        this.description = description; // Description of the policy
        this.assigner = assigner; // ID of the user who assigned the policy
        this.assignee = assignee; // ID of the user who was assigned the policy
        this.purpose = purpose; // Purpose of the policy
        this.sellingData = sellingData; // Data that is sold
        this.sellingInsights = sellingInsights; // Insights that are sold
        this.organisation = organisation; // Organisation that is selling the data
        this.technicalMeasures = technicalMeasures; // Technical measures that are taken to protect the data
        this.organisationalMeasures = organisationalMeasures; // Organisational measures that are taken to protect the data
        this.recipients = recipients; // Recipients of the data
        this.untilTimeDuration = untilTimeDuration; // Duration of the data usage
        this.thirdPartyApproved = thirdPartyStatus; // Status of the policy
        this.memberApproved = memberStatus; // Status of the policy
        this.adminApproved = adminStatus; // Status of the policy
    }

    getPolicy() {
        return this;
    }

    setPolicy(id, creator, issued, description, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasures, organisationalMeasures, recipients, untilTimeDuration, status) {
        this.id = id;
        this.creator = creator;
        this.issued = issued;
        this.description = description;
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
        this.thirdPartyApproved = status; // Status of the policy
        this.memberApproved = status; // Status of the policy
        this.adminApproved = status; // Status of the policy
    }

    // toString
    toString() {
        return `Policy: ${this.id} ${this.creator} ${this.issued} ${this.description} ${this.assigner} ${this.assignee} ${this.purpose} ${this.sellingData} ${this.sellingInsights} ${this.organisation} ${this.technicalMeasures} ${this.organisationalMeasures} ${this.recipients} ${this.untilTimeDuration} ${this.status}`;
    }

    // toJSON
    toJSON() {
        return JSON.stringify(this);
    }

    // fromJSON
    fromJSON(json) {
        const obj = JSON.parse(json);
        return new Policy(obj.id, obj.creator, obj.issued, obj.description, obj.assigner, obj.assignee, obj.purpose, obj.sellingData, obj.sellingInsights, obj.organisation, obj.technicalMeasures, obj.organisationalMeasures, obj.recipients, obj.untilTimeDuration, obj.status);
    }

    // Getters
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }
}