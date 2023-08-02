class Project {
    constructor(url, id, creator, title, description, organisation, projectStatus, hasAgreement, hasAccess, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold, projectPolicies) {
        this.projectURL = url;
        this.projectID = id;
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.organisation = organisation;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.hasAccess = hasAccess;
        this.projectCreationTime = projectCreationTime;
        this.requestStartTime = requestStartTime;
        this.requestEndTime = requestEndTime;
        this.offerEndTime = offerEndTime;
        this.threshold = threshold;
        this.projectPolicies = projectPolicies;
    }

    setProject(url, id, creator, title, description, organisation, projectStatus, hasAgreement, hasAccess, projectCreationTime, requestStartTime, requestEndTime, offerEndTime, threshold, projectPolicies) {
        this.projectURL = url;
        this.projectID = id;
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.organisation = organisation;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.hasAccess = hasAccess;
        this.projectCreationTime = projectCreationTime;
        this.requestStartTime = requestStartTime;
        this.requestEndTime = requestEndTime;
        this.offerEndTime = offerEndTime;
        this.threshold = threshold;
        this.projectPolicies = projectPolicies;
    }

    toJson() {
        return {
            URL: this.projectURL,
            ID: this.projectID,
            creator: this.creator,
            title: this.title,
            description: this.description,
            organisation: this.organisation,
            projectStatus: this.projectStatus,
            hasAgreement: (this.hasAgreement === 'true' ? true : false),
            hasAccess: (this.hasAccess === 'true' ? true : false),
            projectCreationTime: new Date(this.projectCreationTime),
            requestStartTime: new Date(this.requestStartTime),
            requestEndTime: new Date(this.requestEndTime),
            offerEndTime: new Date(this.offerEndTime),
            threshold: this.threshold,
            projectPolicies: this.projectPolicies
        };
    }
}


module.exports = { Project };