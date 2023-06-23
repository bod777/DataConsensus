class Policy {
    constructor(id, timestamp, creator, issued, description, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasure, organisationalMeasure, recipients, untilTimeDuration, status) {
        this.id = id; // Unique identifier for the policy 
        this.timestamp = timestamp; // Timestamp when the policy was submitted
        this.creator = creator; // ID of the user who created the policy
        this.issued = issued; // Timestamp when the policy was issued
        this.description = description; // Description of the policy
        this.assigner = assigner; // ID of the user who assigned the policy
        this.assignee = assignee; // ID of the user who was assigned the policy
        this.purpose = purpose; // Purpose of the policy
        this.sellingData = sellingData; // Data that is sold
        this.sellingInsights = sellingInsights; // Insights that are sold
        this.organisation = organisation; // Organisation that is selling the data
        this.technicalMeasure = technicalMeasure; // Technical measures that are taken to protect the data
        this.organisationalMeasure = organisationalMeasure; // Organisational measures that are taken to protect the data
        this.recipients = recipients; // Recipients of the data
        this.untilTimeDuration = untilTimeDuration; // Duration of the data usage
        this.status = status; // Status of the policy
    }

    getPolicy() {
        return this;
    }

    setPolicy(id, timestamp, creator, issued, description, assigner, assignee, purpose, sellingData, sellingInsights, organisation, technicalMeasure, organisationalMeasure, recipients, untilTimeDuration, status) {
        this.id = id;
        this.timestamp = timestamp;
        this.creator = creator;
        this.issued = issued;
        this.description = description;
        this.assigner = assigner;
        this.assignee = assignee;
        this.purpose = purpose;
        this.sellingData = sellingData;
        this.sellingInsights = sellingInsights;
        this.organisation = organisation;
        this.technicalMeasure = technicalMeasure;
        this.organisationalMeasure = organisationalMeasure;
        this.recipients = recipients;
        this.untilTimeDuration = untilTimeDuration;
        this.status = status;
    }

    // toString
    toString() {
        return `Policy: ${this.id} ${this.timestamp} ${this.creator} ${this.issued} ${this.description} ${this.assigner} ${this.assignee} ${this.purpose} ${this.sellingData} ${this.sellingInsights} ${this.organisation} ${this.technicalMeasure} ${this.organisationalMeasure} ${this.recipients} ${this.untilTimeDuration} ${this.status}`;
    }

    // toJSON
    toJSON() {
        return JSON.stringify(this);
    }

    // fromJSON
    fromJSON(json) {
        const obj = JSON.parse(json);
        return new Policy(obj.id, obj.timestamp, obj.creator, obj.issued, obj.description, obj.assigner, obj.assignee, obj.purpose, obj.sellingData, obj.sellingInsights, obj.organisation, obj.technicalMeasure, obj.organisationalMeasure, obj.recipients, obj.untilTimeDuration, obj.status);
    }

    // Getters
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }

    // other getters and setters
    // getTimestamp() {
    //     return this.timestamp;
    // }
    // setTimestamp(timestamp) {
    //     this.timestamp = timestamp;
    // }

    // getCreator() {
    //     return this.creator;
    // }
    // setCreator(creator) {
    //     this.creator = creator;
    // }

    // getIssued() {
    //     return this.issued;
    // }
    // setIssued(issued) {
    //     this.issued = issued;
    // }

    // getDescription() {
    //     return this.description;
    // }
    // setDescription(description) {
    //     this.description = description;
    // }

    // getAssigner() {
    //     return this.assigner;
    // }
    // setAssigner(assigner) {
    //     this.assigner = assigner;
    // }

    // getAssignee() {
    //     return this.assignee;
    // }
    // setAssignee(assignee) {
    //     this.assignee = assignee;
    // }

    // getPurpose() {
    //     return this.purpose;
    // }
    // setPurpose(purpose) {
    //     this.purpose = purpose;
    // }

    // getSellingData() {
    //     return this.sellingData;
    // }
    // setSellingData(sellingData) {
    //     this.sellingData = sellingData;
    // }

    // getSellingInsights() {
    //     return this.sellingInsights;
    // }
    // setSellingInsights(sellingInsights) {
    //     this.sellingInsights = sellingInsights;
    // }

    // getOrganisation() {
    //     return this.organisation;
    // }
    // setOrganisation(organisation) {
    //     this.organisation = organisation;
    // }

    // getTechnicalMeasure() {
    //     return this.technicalMeasure;
    // }
    // setTechnicalMeasure(technicalMeasure) {
    //     this.technicalMeasure = technicalMeasure;
    // }

    // getOrganisationalMeasure() {
    //     return this.organisationalMeasure;
    // }
    // setOrganisationalMeasure(organisationalMeasure) {
    //     this.organisationalMeasure = organisationalMeasure;
    // }

    // getRecipients() {
    //     return this.recipients;
    // }
    // setRecipients(recipients) {
    //     this.recipients = recipients;
    // }

    // getUntilTimeDuration() {
    //     return this.untilTimeDuration;
    // }
    // setUntilTimeDuration(untilTimeDuration) {
    //     this.untilTimeDuration = untilTimeDuration;
    // }

    // getStatus() {
    //     return this.status;
    // }
    // setStatus(status) {
    //     this.status = status
    // }
}