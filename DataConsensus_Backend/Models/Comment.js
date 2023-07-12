const interactionService = require("../CRUDService/InteractionService.js");

class Comment {
    constructor(id, timeCreated, policyID, author, content, timeModerated, moderated, moderatorID) {
        this.id = id; // Unique identifier for the comment
        this.timeCreated = timeCreated; // Timestamp when the comment was posted 
        this.policyID = policyID; // ID of the associated policy
        this.author = author; // UserID of the comment author
        this.content = content; // Text content of the comment (string)
        this.timeModerated = timeModerated; // Timestamp when the comment was moderated
        this.moderated = moderated; // ; // Indicates if the comment has been moderated by an admin (boolean)
        this.moderatorID = moderatorID; // UserID of the admin who moderated the comment
    }

    async fetchComment(id, session) {
        const solidThing = await interactionService.getComment(id, session);
        this.id = id;
        this.timeCreated = solidThing.predicates["http://purl.org/dc/terms/created"]["literals"]["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.policyID = solidThing.predicates[`http://purl.org/dc/terms/references`]["namedNodes"][0];
        this.author = solidThing.predicates[`http://purl.org/dc/terms/creator`]["namedNodes"][0];
        this.content = solidThing.predicates[`http://purl.org/dc/terms/Text`]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
        this.timeModerated = solidThing.predicates[`http://purl.org/dc/terms/modified`]["literals"]["http://www.w3.org/2001/XMLSchema#dateTime"][0];
        this.moderated = solidThing.predicates[`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/comment#wasModerated`]["literals"]["http://www.w3.org/2001/XMLSchema#boolean"][0];
        this.moderatorID = solidThing.predicates[`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/comment#hasModerated`]?.["namedNodes"][0];
    }

    toJson() {
        let json = {
            id: this.id,
            timeCreated: this.timeCreated,
            policyID: this.policyID,
            author: this.author,
            content: this.content,
            timeModerated: this.timeModerated,
            moderated: this.moderated,
        };
        if (this.moderatorID) {
            json.moderatorID = this.moderatorID;
        }
        return json
    }
}

module.exports = { Comment };