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
const { getSessionFromStorage } = require("@inrupt/solid-client-authn-node");
const { DCTERMS } = require("@inrupt/vocab-common-rdf");

const comment = process.env.COMMENT;
const vote = process.env.VOTE;
const requestsURL = process.env.REQUESTS
const offersURL = process.env.OFFERS
const agreementsURL = process.env.AGREEMENTS
const commentURL = process.env.COMMENTS
const votesURL = process.env.VOTES

function getDatasetUrl(type) {
    let datasetURL;
    switch (type) {
        case 'request':
            datasetURL = requestsURL;
            break;
        case 'offer':
            datasetURL = offersURL;
            break;
        default:
            datasetURL = agreementsURL;
            break;
    }
    return datasetURL;
}

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

    /* COMMENT RELATED FUNCTIONS */

    addComment: async function (req, session) {
        let datasetURL = commentURL;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let commentID = generateID(solidDataset);
        const newComment = createThing({ name: commentID })
            .addUrl(rdf.type, `${comment}#Comment`)
            .addUrl(DCTERMS.created, new Date())
            .addUrl(DCTERMS.references, req.policyURL)
            .addUrl(DCTERMS.creator, req.creator)
            .addStringNoLocale(DCTERMS.text, req.comment)
            .addUrl(`${comment}#wasModerated `, false)
            .build();

        solidDataset = setThing(solidDataset, newComment);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },
    moderateComment: async function (req, session) {
        let datasetURL = commentURL;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        let commentToUpdate = getThing(solidDataset, `${commentURL}#${req.commentID}`);
        commentToUpdate = setUrl(commentToUpdate, `${comment}#wasModerated`, true);
        commentToUpdate = setUrl(commentToUpdate, `${comment}#hasModerator`, req.moderator);
        commentToUpdate = setUrl(commentToUpdate, DCTERMS.modified, new Date());

        solidDataset = setThing(solidDataset, commentToUpdate);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },
    removeComment: async function (req, session) {
        let datasetURL = commentURL;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        let commentToRemove = getThing(solidDataset, `${commentURL}#${req.commentID}`);

        solidDataset = removeThing(solidDataset, commentToRemove);

        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    getCommentsByPolicy: async function (policyURL, session) {
        let datasetURL = commentURL;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let thingList = await getThingAll(solidDataset);
        let comments = await thingList
            .filter((thing) => getUrl(thing, "http://purl.org/dc/terms/references") === policyURL
            ).map((thing) => thing.url);
        return comments;
    },

    getComment: async function (url, session) {
        let datasetURL = commentURL;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let comment = getThing(solidDataset, url);
        return comment;
    },

    /* VOTE RELATED FUNCTIONS */

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

