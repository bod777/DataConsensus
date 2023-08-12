require("dotenv").config();
const {
    buildThing,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getThingAll,
    getUrl,
    getSolidDataset
} = require("@inrupt/solid-client");
const { RDF, XSD, DCTERMS } = require("@inrupt/vocab-common-rdf");
const { v4: uuidv4 } = require('uuid');
const { getGivenSolidDataset, saveGivenSolidDataset, extractTerm } = require("../HelperFunctions.js");
const policyService = require("./PolicyService.js");
const projectService = require("./ProjectService.js");
const { BinaryVote, PreferenceVote } = require("../Models/Vote.js");
const voteSchema = process.env.VOTE;
const votesList = process.env.VOTES
const offersList = process.env.OFFERS
const requestsList = process.env.REQUESTS
const projectsList = process.env.PROJECTS

module.exports = {

    addVote: async function (req, session) {
        let datasetURL = votesList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const existingVotes = getThingAll(solidDataset);
        let existingVote = null;
        for (const vote of existingVotes) {
            const voter = getUrl(vote, `${voteSchema}#hasVoter`);
            const policy = getUrl(vote, `${voteSchema}#hasPolicy`);
            const project = getUrl(vote, DCTERMS.isPartOf);
            if (voter === req.voter && policy === req.policyURL && project === req.projectURL) {
                existingVote = vote;
                break;
            }
        }
        if (existingVote) {
            existingVote = buildThing(existingVote)
                .setDatetime(DCTERMS.modified, new Date())
                .setInteger(`${voteSchema}#voteRank`, req.voteRank)
                .build();
        } else {
            const voteID = uuidv4();
            const voteURL = `${datasetURL}#${voteID}`;
            let voteType;
            if (req.isPreference) {
                voteType = `${voteSchema}#PreferenceVote`;
            } else {
                voteType = `${voteSchema}#BinaryVote`;
            }
            existingVote = buildThing(createThing({ url: voteURL }))
                .addUrl(RDF.type, `${voteSchema}#Vote`)
                .addUrl(`${voteSchema}#hasVoteType`, voteType)
                .addUrl(`${voteSchema}#hasVoter`, req.voter)
                .addUrl(`${voteSchema}#hasPolicy`, req.policyURL)
                .addUrl(DCTERMS.isPartOf, req.projectURL)
                .setDatetime(DCTERMS.issued, new Date())
                .setDatetime(DCTERMS.modified, new Date())
                .addInteger(`${voteSchema}#voteRank`, req.voteRank)
                .build();
        }
        solidDataset = setThing(solidDataset, existingVote);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    countVotesByRankPolicy: async function (req, session) {
        const datasetUrl = votesList;
        const solidDataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });

        const things = getThingAll(solidDataset);
        const policyVotes = things.filter(thing => getUrl(thing, `${voteSchema}#hasPolicy`) === req.policyURL);
        const filteredPolicyVotes = policyVotes.filter(vote => {
            const voteRankString = vote.predicates[`${voteSchema}#voteRank`].literals[XSD.integer][0];
            const voteRank = Number(voteRankString);
            return voteRank === req.rank;
        });
        const count = filteredPolicyVotes.length;
        return count;
    },

    getBinaryVote: async function (req, session) {
        let datasetURL = votesList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const existingVotes = getThingAll(solidDataset);
        let existingVote = null;
        for (const vote of existingVotes) {
            const voter = getUrl(vote, `${voteSchema}#hasVoter`);
            const policy = getUrl(vote, `${voteSchema}#hasPolicy`);
            if (voter === req.voter && policy === req.policyURL) {
                existingVote = vote;
                break;
            }
        }
        if (existingVote === null) {
            throw new Error("No votes found");
        }
        const voteURL = existingVote.url;
        const voteType = extractTerm(existingVote.predicates[`${voteSchema}#hasVoteType`]["namedNodes"][0]);
        const project = existingVote.predicates[DCTERMS.isPartOf]["namedNodes"][0];
        const policy = existingVote.predicates[`${voteSchema}#hasPolicy`]["namedNodes"][0];
        const voter = existingVote.predicates[`${voteSchema}#hasVoter`]["namedNodes"][0];
        const created = existingVote.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        const modified = existingVote.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0];
        const rank = existingVote.predicates[`${voteSchema}#voteRank`]["literals"][XSD.integer][0];
        const vote = new BinaryVote(voteURL, project, policy, voter, created, modified, rank);
        return vote.toJson();
    },

    getPreferenceVote: async function (req, session) {
        let datasetURL = votesList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const existingVotes = getThingAll(solidDataset);
        let existingVote = null;
        for (const vote of existingVotes) {
            const voter = getUrl(vote, `${voteSchema}#hasVoter`);
            const policy = getUrl(vote, `${voteSchema}#hasPolicy`);
            const project = getUrl(vote, DCTERMS.isPartOf);
            if (voter === req.voter && policy === req.policyURL && project === req.projectURL) {
                existingVote = vote;
                break;
            }
        }
        if (existingVote === null) {
            throw new Error("No votes found");
        }
        const voteURL = existingVote.url;
        const voteType = extractTerm(existingVote.predicates[`${voteSchema}#hasVoteType`]["namedNodes"][0]);
        const project = existingVote.predicates[DCTERMS.isPartOf]["namedNodes"][0];
        const policy = existingVote.predicates[`${voteSchema}#hasPolicy`]["namedNodes"][0];
        const voter = existingVote.predicates[`${voteSchema}#hasVoter`]["namedNodes"][0];
        const created = existingVote.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0];
        const modified = existingVote.predicates[DCTERMS.modified]["literals"][XSD.dateTime][0];
        const rank = existingVote.predicates[`${voteSchema}#voteRank`]["literals"][XSD.integer][0];
        const vote = new PreferenceVote(voteURL, project, policy, voter, created, modified, rank);
        return vote.toJson();
    },
};
