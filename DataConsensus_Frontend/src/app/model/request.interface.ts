export interface Request {
    uid: string;
    creator: string;
    policyCreationTime: string;
    isPartOf: string;
    assigner: string;
    assignee: string;
    adminApproved: string;
    memberApproved: string;
    thirdPartyApproved: string;
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
    projectCreationTime: Date;
    requestStartTime: Date;
    requestEndTime: Date;
    offerEndTime: Date;
    threshold: string;
}
