export interface Comment {
    id: string;
    timeCreated: string;
    datetimeCreated?: Date;
    policyID: string;
    author: string;
    content: string;
    datetimeModerated?: Date;
    booleanModerated?: boolean;
    timeModerated?: string;
    moderated?: string;
}
