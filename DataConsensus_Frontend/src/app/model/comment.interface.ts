export interface Comment {
    commentURL: string;
    commentID: string;
    timeCreated: Date;
    policyID: string;
    author: string;
    content: string;
    timeModerated: Date;
    moderated: boolean;
}
