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
        // console.log("Adding vote: ", JSON.stringify(req));
        let datasetURL = votesList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        // Search for an existing vote from the same voter on the same policy.
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
            // console.log("Updating existing vote to ", req.voteRank, " for ", req.policyURL);
            existingVote = buildThing(existingVote)
                .setDatetime(DCTERMS.modified, new Date())
                .setInteger(`${voteSchema}#voteRank`, req.voteRank)
                .build();
        } else {
            // console.log("Creating new vote to ", req.voteRank, " for ", req.policyURL);
            const voteID = uuidv4();
            const voteURI = `${datasetURL}#${voteID}`;

            existingVote = buildThing(createThing({ url: voteURI }))
                .addUrl(RDF.type, `${voteSchema}#Vote`)
                .addUrl(`${voteSchema}#hasVoter`, req.voter)
                .addUrl(`${voteSchema}#hasPolicy`, req.policyURL)
                .setDatetime(DCTERMS.issued, new Date())
                .setDatetime(DCTERMS.modified, new Date())
                .addInteger(`${voteSchema}#voteRank`, req.voteRank)
                .build();
        }
        // console.log("Saving vote: ", JSON.stringify(existingVote));
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
            return voteRank === 1;
        });
        const count = filteredPolicyVotes.length;
        return count;
    },

    getVote: async function (req, session) {
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
    }
}
