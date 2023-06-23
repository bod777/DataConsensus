class Comment {
    constructor(id, timestamp, policyID, author, content, moderated, deleted, moderatorID, deletionTimestamp) {
        this.id = id; // Unique identifier for the comment
        this.timestamp = timestamp; // Timestamp when the comment was posted 
        this.policyID = policyID; // ID of the associated policy
        this.author = author; // UserID of the comment author
        this.content = content; // Text content of the comment (string)
        this.moderated = moderated; // ; // Indicates if the comment has been moderated by an admin (boolean)
        this.deleted = deleted; // Indicates if the comment has been deleted by an admin (boolean)
        this.moderatorID = moderatorID; // UserID of the admin who moderated the comment
        this.deletionTimestamp = deletionTimestamp; // Timestamp when the comment was deleted (datetime)
    }

    // Include methods
}