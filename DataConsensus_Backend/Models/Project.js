const policyService = require("../CRUDService/PolicyService.js");
const { ODRL, DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const { extractTerm } = require("../HelperFunctions.js");

const oac = process.env.OAC;
const project = process.env.PROJECT;

class Project {
    constructor(id, creator, title, description, organisation, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType, projectPolicies) {
        this.id = id;
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.organisation = organisation;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.projectCreationTime = projectCreationTime;
        this.deliberationStartTime = deliberationStartTime;
        this.requestTime = requestTime;
        this.offerTime = offerTime;
        this.threshold = threshold;
        this.thresholdType = thresholdType;
        this.projectPolicies = projectPolicies;
    }

    getProject() {
        return this;
    }

    setProject(id, creator, title, description, organisation, projectStatus, hasAgreement, projectCreationTime, deliberationStartTime, requestTime, offerTime, threshold, thresholdType, projectPolicies) {
        this.id = id;
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.organisation = organisation;
        this.projectStatus = projectStatus;
        this.hasAgreement = hasAgreement;
        this.projectCreationTime = projectCreationTime;
        this.deliberationStartTime = deliberationStartTime;
        this.requestTime = requestTime;
        this.offerTime = offerTime;
        this.threshold = threshold;
        this.thresholdType = thresholdType;
        this.projectPolicies = projectPolicies;
    }

    async fetchProject(projectURL, session) {
        const projectThing = await policyService.getProject(projectURL, session);
        const projectPolicies = await policyService.getProjectPolicies(projectURL, session);
        this.id = extractTerm(projectURL);
        this.creator = projectThing.predicates[DCTERMS.creator]["namedNodes"][0];
        this.organisation = extractTerm(projectThing.predicates[`${oac}Organisation`]["namedNodes"][0]);
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
        this.projectPolicies = projectPolicies;
    }

    toJson() {
        return {
            id: this.uid,
            creator: this.creator,
            title: this.title,
            description: this.description,
            organisation: this.organisation,
            projectStatus: this.projectStatus,
            hasAgreement: this.hasAgreement,
            projectCreationTime: this.projectCreationTime,
            deliberationStartTime: this.deliberationStartTime,
            requestTime: this.requestTime,
            offerTime: this.offerTime,
            threshold: this.threshold,
            projectPolicies: this.projectPolicies,
            thresholdType: this.thresholdType
        };
    }
}


module.exports = { Project };