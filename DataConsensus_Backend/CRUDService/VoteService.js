require("dotenv").config();
const {
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getThingAll,
    getUrl,
    getSolidDataset
} = require("@inrupt/solid-client");
const vote = process.env.VOTE;
const votesURL = process.env.VOTES

function generateID(solidDataset) {
    let array = getThingAll(solidDataset);
    let ID = array.length + 2;
    return ID;
}

async function getGivenSolidDataset(datasetURL, session) {
    return await getSolidDataset(datasetURL, { fetch: session.fetch });
}

async function saveGivenSolidDataset(datasetURL, courseSolidDataset, session) {
    const savedSolidDataset = await saveSolidDatasetAt(
        datasetURL,
        courseSolidDataset,
        { fetch: session.fetch }
    );
}

module.exports = {
    addVote: async function (req, session) {
        let datasetURL = votesURL;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        // Search for an existing vote from the same voter on the same policy.
        const existingVotes = getThingAll(solidDataset);
        let existingVote = null;
        for (const vote of existingVotes) {
            const voter = getUrl(vote, `${vote}#hasVoter`);
            const policy = getUrl(vote, `${vote}#hasPolicy`);
            if (voter === req.voter && policy === req.policyURL) {
                existingVote = vote;
                break;
            }
        }

        if (existingVote) {
            // Update the existing vote.
            existingVote = setUrl(existingVote, `${vote}#voteRank`, req.voteRank);
        } else {
            // Create a new vote.
            let voteID = generateID(solidDataset);
            existingVote = createThing({ name: voteID })
                .addUrl(rdf.type, `${vote}#Vote`)
                .addUrl(`${vote}#hasVoter`, req.voter)
                .addUrl(`${vote}#hasPolicy`, req.policyURL)
                .addInteger(`${vote}#voteRank`, req.voteRank)
                .build();
        }

        solidDataset = setThing(solidDataset, existingVote);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    countVotesByRankPolicy: async function (req, session) {
        const datasetUrl = votesURL;
        const solidDataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });

        const things = getThingAll(solidDataset);
        let count = 0;

        for (let thing of things) {
            const policy = getUrl(thing, `${vote}#hasDocument`);
            if (policy !== req.policyUrl) {
                continue;
            }
            const rank = getUrl(thing, `${vote}#voteRank`);
            if (rank === req.rank) {
                count++;
            }
        }
        return count;
    },
}
