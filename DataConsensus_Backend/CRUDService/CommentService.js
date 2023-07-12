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
const { DCTERMS } = require("@inrupt/vocab-common-rdf");

const comment = process.env.COMMENT;
const commentURL = process.env.COMMENTS

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
    }
}

