const commentService = require("../CRUDService/CommentService.js");
const { DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");

const commentSchema = process.env.COMMENT;

class Comment {
    constructor(url, id, timeCreated, policyURL, author, content, timeModerated, moderated, moderatorID) {
        this.commentURL = url;
        this.commentID = id;
        this.timeCreated = timeCreated; // Timestamp when the comment was posted 
        this.policyURL = policyURL; // ID of the associated policy
        this.author = author; // UserID of the comment author
        this.content = content; // Text content of the comment (string)
        this.timeModerated = timeModerated; // Timestamp when the comment was moderated
        this.moderated = moderated; // ; // Indicates if the comment has been moderated by an admin (boolean)
        this.moderatorID = moderatorID; // UserID of the admin who moderated the comment
    }

    async fetchComment(commentURL, session) {
        const solidThing = await commentService.getComment(commentURL, session);
        this.commentURL = commentURL;
        this.commentID = commentURL.split('#')[1];
        this.timeCreated = new Date(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
        this.policyURL = solidThing.predicates[DCTERMS.references]["namedNodes"][0];
        this.author = solidThing.predicates[DCTERMS.creator]["namedNodes"][0];
        this.content = solidThing.predicates[`${commentSchema}#text`]["literals"][XSD.string][0];
        this.timeModerated = new Date(solidThing.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0]);
        this.moderated = solidThing.predicates[`${commentSchema}#wasModerated`]["literals"][XSD.boolean][0] === "true" ? true : false;
        this.moderatorID = solidThing.predicates[`${commentSchema}#hasModerated`]?.["namedNodes"][0];
    }

    toJson() {
        let json = {
            commentURL: this.commentURL,
            commentID: this.commentID,
            timeCreated: this.timeCreated,
            policyURL: this.policyURL,
            author: this.author,
            content: this.content,
            timeModerated: this.timeModerated,
            moderated: this.moderated,
        };
        if (this.moderatorID) {
            json.moderatorID = this.moderatorID;
        }
        // console.log(json);
        return json
    }
}

module.exports = { Comment };