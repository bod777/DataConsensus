require("dotenv").config();
const { DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const voteService = require("../CRUDService/VoteService.js");
const voteSchema = process.env.VOTE;
const { extractTerm } = require("../HelperFunctions.js");

class Vote {
    constructor(voteURL, voteType, project, policy, voter, created, modified, rank) {
        this.voteURL = voteURL;
        this.voteType = voteType;
        this.project = project;
        this.policy = policy;
        this.voter = voter;
        this.created = created;
        this.modified = modified;
        this.rank = rank;
    }

    toJson() {
        return {
            voteURL: this.voteURL,
            voteType: this.voteType,
            project: this.project,
            policy: this.policy,
            voter: this.voter,
            created: this.created,
            modified: this.modified,
            rank: this.rank
        };
    }
}

class BinaryVote extends Vote {
    constructor(voteURL, project, policy, voter, created, modified, rank) {
        super(voteURL, "BinaryVote", project, policy, voter, created, modified, rank);
    }

    async fetchVote(req, session) {
        const solidThing = await voteService.getBinaryVote(req, session);
        if (solidThing === null) {
            throw new Error("No votes found");
        }
        this.voteURL = solidThing.url;
        this.voteType = extractTerm(solidThing.predicates[`${voteSchema}#hasVoteType`]["namedNodes"][0]);
        this.project = solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0];
        this.policy = solidThing.predicates[`${voteSchema}#hasPolicy`]["namedNodes"][0];
        this.voter = solidThing.predicates[`${voteSchema}#hasVoter`]["namedNodes"][0];
        this.created = solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.modified = solidThing.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0];
        this.rank = solidThing.predicates[`${voteSchema}#voteRank`]["literals"][XSD.integer][0];
    }
}

class PreferenceVote extends Vote {
    constructor(voteURL, project, policy, voter, created, modified, rank) {
        super(voteURL, "PreferenceVote", project, policy, voter, created, modified, rank);
    }

    async fetchVote(req, session) {
        const solidThing = await voteService.getPreferenceVote(req, session);
        if (solidThing === null) {
            throw new Error("No votes found");
        }
        this.voteURL = solidThing.url;
        this.voteType = extractTerm(solidThing.predicates[`${voteSchema}#hasVoteType`]["namedNodes"][0]);
        this.project = solidThing.predicates[DCTERMS.isPartOf]["namedNodes"][0];
        this.policy = solidThing.predicates[`${voteSchema}#hasPolicy`]["namedNodes"][0];
        this.voter = solidThing.predicates[`${voteSchema}#hasVoter`]["namedNodes"][0];
        this.created = solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        this.modified = solidThing.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0];
        this.rank = solidThing.predicates[`${voteSchema}#voteRank`]["literals"][XSD.integer][0];
    }
}

module.exports = { Vote, BinaryVote, PreferenceVote };