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
const { getGivenSolidDataset, saveGivenSolidDataset } = require("../HelperFunctions.js");
const voteSchema = process.env.VOTE;
const votesList = process.env.VOTES

module.exports = {
    addVote: async function (req, session) {
        let datasetURL = votesList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        // console.log(req);
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
        if (existingVote) {
            // console.log("existingVote", existingVote);
            existingVote = buildThing(existingVote)
                .setDatetime(DCTERMS.modified, new Date())
                .setInteger(`${voteSchema}#voteRank`, req.voteRank)
                .build();
        } else {
            // console.log("newVote");
            const voteID = uuidv4();
            const voteURL = `${datasetURL}#${voteID}`;
            // console.log(voteURL);
            let voteType;
            if (req.isPreference) {
                voteType = `${voteSchema}#PreferenceVote`;
            } else {
                voteType = `${voteSchema}#BinaryVote`;
            }
            // console.log(voteType);
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
            // console.log("existing vote built");
        }
        // console.log("existingVote", existingVote);
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
        return existingVote;
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
        return existingVote;
    }
}
