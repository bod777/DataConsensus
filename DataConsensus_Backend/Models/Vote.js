
class Vote {
    constructor(id, timestamp, policyID, userId, value) {
        this.id = id; // Unique identifier for the vote
        this.timestamp = timestamp; // Timestamp when the vote was submitted
        this.policyID = policyID; // ID of the associated policy
        this.userId = userId; // ID of the user who cast the vote
        this.value = value; // The value of the vote (e.g., +1 for upvote, -1 for downvote)
    }

    // Include methods
}

