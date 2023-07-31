require("dotenv").config();
const fs = require('fs');
const {
    buildThing,
    createThing,
    setThing,
    setStringNoLocale,
    setUrl,
    getUrl,
    getThing,
    getThingAll,
    getFile,
    overwriteFile,
    isRawData,
    getContentType,
    getSourceUrl
} = require("@inrupt/solid-client");
const { getSessionFromStorage, getSessionIdFromStorageAll } = require("@inrupt/solid-client-authn-node");
const { RDF, FOAF, DCTERMS } = require("@inrupt/vocab-common-rdf");
const Transformer = require("../Logic/Transformer.js");
const { getGivenSolidDataset, saveGivenSolidDataset, getDatasetUrl } = require("../HelperFunctions.js");

const user = process.env.USER;
const membersURL = process.env.MEMBER_LIST;
const thirdPartiesURL = process.env.THIRDPARTY_LIST;
const adminsURL = process.env.ADMIN_LIST;
const resourceURL = process.env.RESOURCE_URL;

module.exports = {

    /* USER RELATED FUNCTIONS */

    checkUserByType: async function (req, session) {
        const datasetURL = getDatasetUrl(req.type);

        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const user = getThing(solidDataset, req.webID);

        if (user) {
            return true;
        }
        return false;
    },

    addMember: async function (req, session) {

        let solidDataset = await getGivenSolidDataset(membersURL, session);

        const newMember = buildThing(createThing({ url: req.body.webID }))
            .addUrl(RDF.type, `${user}#User`)
            .addStringNoLocale(FOAF.name, req.body.name)
            .addStringNoLocale(FOAF.mbox, req.body.email)
            .addDatetime(DCTERMS.issued, new Date())
            .addUrl(`${user}#hasUserType`, `${user}#Member`)
            .addUrl(`${user}#dataSource`, req.body.dataSource)
            .build();

        solidDataset = setThing(solidDataset, newMember);
        await saveGivenSolidDataset(membersURL, solidDataset, session);
    },

    addThirdParty: async function (req, session) {

        let solidDataset = await getGivenSolidDataset(thirdPartiesURL, session);
        const newThirdParty = buildThing(createThing({ url: req.body.webID }))
            .addUrl(RDF.type, `${user}#User`)
            .addStringNoLocale(FOAF.mbox, req.body.email)
            .addStringNoLocale(FOAF.name, req.body.name)
            .addDatetime(DCTERMS.issued, new Date())
            .addUrl(`${user}#hasUserType`, `${user}#ThirdParty`)
            .addUrl("https://w3id.org/dpv#Organisation", `https://w3id.org/dpv#${req.body.org}`)
            .addStringNoLocale(DCTERMS.description, req.body.description)
            .build();

        solidDataset = setThing(solidDataset, newThirdParty);
        await saveGivenSolidDataset(thirdPartiesURL, solidDataset, session);
    },

    addAdmin: async function (req, session) {

        let solidDataset = await getGivenSolidDataset(adminsURL, session);
        const newAdmin = buildThing(createThing({ url: req.body.webID }))
            .addUrl(RDF.type, `${user}#User`)
            .addStringNoLocale(FOAF.mbox, req.body.email)
            .addDatetime(DCTERMS.issued, new Date())
            .addStringNoLocale(FOAF.name, req.body.name)
            .addUrl(`${user}#hasUserType`, `${user}#Admin`)
            .build();

        solidDataset = setThing(solidDataset, newAdmin);
        await saveGivenSolidDataset(adminsURL, solidDataset, session);
    },

    getUser: async function (req, session) {
        let datasetURL = getDatasetUrl(req.type);
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const user = getThing(solidDataset, req.webID);
        return user;
    },

    updateUser: async function (req, session) {
        const datasetURL = getDatasetUrl(req.body.datasetURL);
        let solidDataset = await getGivenSolidDataset(datasetURL, session);
        let projectToUpdate = getThing(solidDataset, req.body.webID);
        if (req.body.name) {
            // console.log(req.body.name);
            projectToUpdate = buildThing(projectToUpdate)
                .setStringNoLocale(FOAF.name, req.body.name)
                .build();
        }
        if (req.body.email) {
            // console.log(req.body.email);
            projectToUpdate = buildThing(projectToUpdate)
                .setStringNoLocale(FOAF.mbox, req.body.email)
                .build();
        }
        if (req.body.orgType) {
            // console.log(req.body.orgType);
            projectToUpdate = buildThing(projectToUpdate)
                .setUrl(`https://w3id.org/dpv#Organisation`, `https://w3id.org/dpv#${req.body.orgType}`)
                .build();
        }
        if (req.body.dataSource) {
            // console.log(req.body.dataSource);
            projectToUpdate = buildThing(projectToUpdate)
                .setUrl(`${user}#dataSource`, req.body.dataSource)
                .build();
        }
        if (req.body.description) {
            // console.log(req.body.description);
            projectToUpdate = buildThing(projectToUpdate)
                .setStringNoLocale(DCTERMS.description, req.body.description)
                .build();
        }

        solidDataset = setThing(solidDataset, projectToUpdate);
        await saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    getMemberCount: async function (date, session) {
        const datasetUrl = membersURL;
        const solidDataset = await getGivenSolidDataset(datasetUrl, session);
        const users = getThingAll(solidDataset);
        const filteredUsers = users.filter(user => {
            return new Date(user.predicates[DCTERMS.issued]["literals"]["http://www.w3.org/2001/XMLSchema#dateTime"][0]) <= new Date(date);
        });
        return filteredUsers.length + 1;
    },

    addNewData: async function (fileURL, appSession, userSession) {
        try {
            const file = await getFile(fileURL, { fetch: userSession.fetch });
            const fileHash = await Transformer.hashFileURL(fileURL);
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const csvText = new TextDecoder().decode(data);
            const updatedCsvText = Transformer.addColumnToCSV(csvText, fileHash);

            const existingFile = await getFile(resourceURL, { fetch: appSession.fetch });
            const existingArrayBuffer = await existingFile.arrayBuffer();
            const existingData = new Uint8Array(existingArrayBuffer);
            const existingCsvText = new TextDecoder().decode(existingData);

            const appendedCsvText = existingCsvText + "\n" + updatedCsvText;
            const appendedData = new TextEncoder().encode(appendedCsvText);

            const savedFile = await overwriteFile(
                resourceURL,
                appendedData,
                { contentType: "text/csv", fetch: appSession.fetch }
            );

        } catch (error) {
            console.log(error);
        }
    },

    removeData: async function (fileURL, session) {
        try {
            console.log(fileURL);
            const fileHash = await Transformer.hashFileURL(fileURL);
            console.log(fileHash);
            const file = await getFile(
                resourceURL,
                { fetch: session.fetch }
            );
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const csvText = new TextDecoder().decode(data);

            const rows = csvText.split('\n');
            const matchingRowIndices = [];

            for (let i = 0; i < rows.length; i++) {
                const columns = rows[i].split(',');
                const identifier = columns[2];
                if (identifier === fileHash) {
                    matchingRowIndices.push(i);
                }
            }

            if (matchingRowIndices.length > 0) {
                for (let i = matchingRowIndices.length - 1; i >= 0; i--) {
                    const matchingRowIndex = matchingRowIndices[i];
                    rows.splice(matchingRowIndex, 1);
                }
                const updatedCsvText = rows.join('\n');
                console.log(updatedCsvText);
                const updatedData = new TextEncoder().encode(updatedCsvText);
                console.log(updatedData);
                const savedFile = await overwriteFile(
                    resourceURL,
                    updatedData,
                    { contentType: "text/csv", fetch: session.fetch }
                );
            } else {
                console.log(`No data found for the hashed identifier: ${hashedIdentifier}`);
                return null;
            }
        } catch (error) {
            console.log(error);
        }
    },
}