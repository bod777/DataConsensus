interface ProjectData {
    creator: string;
    title: string;
    description: string;
    organisation: string;
    projectStatus: string;
    hasAgreement: string;
    projectCreationTime: string;
    deliberationStartTime: string;
    requestTime: string;
    offerTime: string;
    threshold: string;
    projectPolicies: {
        requests: string[];
        offers: string[];
        agreements: string[];
    };
    thresholdType: string;
}
