export interface Project {
    projectURL: string;
    projectID: string;
    creator: string;
    title: string;
    description: string;
    organisation: string;
    projectStatus: string;
    hasAgreement: string;
    projectCreationTime: Date;
    requestStartTime: Date;
    requestEndTime: Date;
    offerEndTime: Date;
    threshold: number;
    projectPolicies: {
        requests: string[];
        offers: string[];
        agreements: string[];
    };
}
