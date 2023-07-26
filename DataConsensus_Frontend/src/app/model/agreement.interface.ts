export interface Agreement {
    uid: string;
    creator: string;
    policyCreationTime: string;
    isPartOf: string;
    assigner: string;
    assignee: string;
    references: string;
    purpose: string;
    sellingData: boolean;
    sellingInsights: boolean;
    organisation: string;
    techOrgMeasures: string[];
    recipients: string[];
    untilTimeDuration: string;
    title: string;
    description: string;
    projectStatus: string;
    hasAgreement: string;
    projectCreationTime: string;
    deliberationStartTime: string;
    requestTime: string;
    offerTime: string;
    threshold: string;
    thresholdType: string;
}
