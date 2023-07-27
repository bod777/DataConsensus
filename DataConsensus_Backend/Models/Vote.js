require("dotenv").config();
const { DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const voteService = require("../CRUDService/VoteService.js");
const voteSchema = process.env.VOTE;

class Vote {
    constructor(voteURL, policy, voter, created, modified, rank) {
        this.voteURL = voteURL;
        this.policy = policy;
        this.voter = voter;
        this.created = created;
        this.modified = modified;
        this.rank = rank;
    }

    async fetchVote(voter, policyURL, session) {
        const solidThing = await voteService.getVote({ voter, policyURL }, session);
        if (solidThing === null) {
            throw new Error("No votes found");
        }
        this.voteURL = solidThing.url;
        this.policy = solidThing.predicates[`${voteSchema}#hasPolicy`]["namedNodes"][0];
        this.voter = solidThing.predicates[`${voteSchema}#hasVoter`]["namedNodes"][0];
        this.created = solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.modified = solidThing.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0];
        this.rank = solidThing.predicates[`${voteSchema}#voteRank`]["literals"][XSD.integer][0];
    }

    toJson() {
        return {
            voteURL: this.voteURL,
            policy: this.policy,
            voter: this.voter,
            created: this.created,
            modified: this.modified,
            rank: this.rank
        };
    }
}

module.exports = { Vote };