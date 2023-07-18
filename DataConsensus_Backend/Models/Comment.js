const commentService = require("../CRUDService/CommentService.js");
const { DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");

const commentSchema = process.env.COMMENT;

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
        const solidThing = await commentService.getComment(id, session);
        console.log(solidThing);
        this.id = id;
        this.timeCreated = solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.policyID = solidThing.predicates[DCTERMS.references]["namedNodes"][0];
        this.author = solidThing.predicates[DCTERMS.creator]["namedNodes"][0];
        this.content = solidThing.predicates[`${commentSchema}#text`]["literals"][XSD.string][0];
        this.timeModerated = solidThing.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0];
        this.moderated = solidThing.predicates[`${commentSchema}#wasModerated`]["literals"][XSD.boolean][0];
        this.moderatorID = solidThing.predicates[`${commentSchema}#hasModerated`]?.["namedNodes"][0];
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