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
            created: new Date(this.created),
            modified: new Date(this.modified),
            rank: Number(this.rank)
        };
    }
}

class BinaryVote extends Vote {
    constructor(voteURL, project, policy, voter, created, modified, rank) {
        super(voteURL, "BinaryVote", project, policy, voter, created, modified, rank);
    }
}

class PreferenceVote extends Vote {
    constructor(voteURL, project, policy, voter, created, modified, rank) {
        super(voteURL, "PreferenceVote", project, policy, voter, created, modified, rank);
    }
}

module.exports = { Vote, BinaryVote, PreferenceVote };