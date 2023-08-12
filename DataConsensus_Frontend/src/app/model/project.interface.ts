export interface Project {
    URL: string;
    ID: string;
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
    hasAccess: boolean;
    projectPolicies: {
        requests: string[];
        offers: string[];
        agreements: string[];
    };
    results: {
        request: {},
        offers: {},
    }
}
