export interface Project {
    projectURL: string;
    projectID: string;
    creator: string;
    title: string;
    description: string;
    organisation: string;
    projectStatus: string;
    hasAgreement: boolean;
    projectCreationTime: Date;
    requestStartTime: Date;
    requestEndTime: Date;
    offerEndTime: Date;
    threshold: number;
    requestCutoff: number;
    offerCutoff: number;
    untilTimeDuration: Date;
    isAgreementActive: boolean;
    projectPolicies: {
        requests: string[];
        offers: string[];
        agreements: string[];
    };
}
