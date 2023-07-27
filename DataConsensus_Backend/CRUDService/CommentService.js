require("dotenv").config();
const {
    buildThing,
    createThing,
    setThing,
    setUrl,
    setDatetime,
    setBoolean,
    getThing,
    getThingAll,
    getUrl,
    addBoolean,
    addDatetime,
    addStringNoLocale,
    removeThing
} = require("@inrupt/solid-client");
const { v4: uuidv4 } = require('uuid');
const { DCTERMS, RDF } = require("@inrupt/vocab-common-rdf");
const { getGivenSolidDataset, saveGivenSolidDataset } = require("../HelperFunctions.js");

const commentSchema = process.env.COMMENT;
const commentsList = process.env.COMMENTS;

module.exports = {
    addComment: async function (req, session) {
        let datasetURL = commentsList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        const commentID = uuidv4();
        const commentURL = `${datasetURL}#${commentID}`;
        const newComment = buildThing(createThing({ url: commentURL }))
            .addUrl(RDF.type, `${commentSchema}#Comment`)
            .addDatetime(DCTERMS.issued, new Date())
            .addDatetime(DCTERMS.modified, new Date())
            .addUrl(DCTERMS.references, req.policyURL)
            .addUrl(DCTERMS.creator, req.creator)
            .addStringNoLocale(`${commentSchema}#text`, req.comment)
            .addBoolean(`${commentSchema}#wasModerated`, false)
            .build();

        solidDataset = setThing(solidDataset, newComment);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
        return commentURL;
    },
    moderateComment: async function (req, session) {
        let datasetURL = commentsList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);

        let commentToUpdate = getThing(solidDataset, `${req.commentURL}`);
        commentToUpdate = buildThing(commentToUpdate)
            .setBoolean(`${commentSchema}#wasModerated`, true)
            .setUrl(`${commentSchema}#hasModerator`, req.moderator)
            .setDatetime(DCTERMS.modified, new Date())
            .build();

        solidDataset = setThing(solidDataset, commentToUpdate);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    removeComment: async function (commentURL, session) {
        let datasetURL = commentsList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let commentToRemove = getThing(solidDataset, commentURL);
        solidDataset = removeThing(solidDataset, commentToRemove);

        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    getCommentsByPolicy: async function (policyURL, session) {
        let datasetURL = commentsList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let thingList = await getThingAll(solidDataset);
        let comments = await thingList
            .filter((thing) => getUrl(thing, "http://purl.org/dc/terms/references") === policyURL
            ).map((thing) => thing.url);
        return comments;
    },

    getComment: async function (commentURL, session) {
        let datasetURL = commentsList;
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let comment = getThing(solidDataset, commentURL);
        return comment;
    }
}
