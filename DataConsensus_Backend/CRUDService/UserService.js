require("dotenv").config();
const {
    buildThing,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getUrl,
    getThing,
    getThingAll,
    getSolidDataset,
    getFile,
    isRawData,
    getContentType,
    getSourceUrl
} = require("@inrupt/solid-client");
const { getSessionFromStorage, getSessionIdFromStorageAll } = require("@inrupt/solid-client-authn-node");
const { FOAF, DCTERMS } = require("@inrupt/vocab-common-rdf");
const Transformer = require("../Logic/Transformer.js");

const user = process.env.USER;
const memberURL = process.env.MEMBER_LIST;
const thirdPartyURL = process.env.THIRDPARTY_LIST;
const adminURL = process.env.ADMIN_LIST;
const resourceURL = process.env.RESOURCE_URL;

async function getGivenSolidDataset(datasetURL, session) {
    return await getSolidDataset(datasetURL, { fetch: session.fetch });
}

async function saveGivenSolidDataset(datasetURL, courseSolidDataset, session) {
    const savedSolidDataset = await saveSolidDatasetAt(
        datasetURL,
        courseSolidDataset,      // fetch from authenticated Session
        { fetch: session.fetch }
    );
}

function getDatasetUrl(userType) {
    let datasetURL;
    switch (userType) {
        case 'MEMBER':
            datasetURL = memberURL;
            break;
        case 'THIRDPARTY':
            datasetURL = thirdPartyURL;
            break;
        default:
            datasetURL = adminURL;
            break;
    }
    return datasetURL;
}

const userPrefix = namespace("https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schemas/user#");

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
        console.log(userPrefix('type'));
        let solidDataset = await getGivenSolidDataset(memberURL, session);
        console.log(req.body.webID);
        //building user details as thing
        const newMember = buildThing(createThing({ url: req.body.webID }))
            // .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", `${user}#User`)
            .addUrl(rdf.type, userPrefix('User'))
            .addStringNoLocale("http://xmlns.com/foaf/0.1/name", req.body.name)
            .addStringNoLocale("http://xmlns.com/foaf/0.1/email", req.body.email)
            .addUrl(userPrefix("hasUserType"), userPrefix("Member")) // specifying USER TYPE (Member, ThirdParty, Admin)
            .addUrl(`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schemas/user#dataSource`, req.body.dataSource) // specifying datasource
            .build();

        solidDataset = setThing(solidDataset, newMember);
        await saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    addThirdParty: async function (req, session) {

        let solidDataset = await getGivenSolidDataset(thirdPartyURL, session);

        const newThirdParty = buildThing(createThing({ name: req.webId }))
            .addUrl(rdf.type, `${user}#User`)
            .addStringNoLocale("http://xmlns.com/foaf/0.1/email", req.email)
            .addStringNoLocale("http://xmlns.com/foaf/0.1/name", req.name)
            .addUrl(`${user}#hasUserType`, `${user}#ThirdParty`)
            .addUrl("https://w3id.org/dpv#Organisation", `https://w3id.org/dpv#${req.org}`)
            .addStringNoLocale(DCTERMS.description, req.description)
            .build();

        solidDataset = setThing(solidDataset, newThirdParty);
        await saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    getUser: async function (req, session) {
        let datasetURL = getDatasetUrl(req.type);
        const solidDataset = await getGivenSolidDataset(datasetURL, session);
        const user = getThing(solidDataset, req.webID);
        return user;
    },

    updateUser: async function (req, session) {
        let solidDataset = await getGivenSolidDataset(req.datasetURL, session);
        let projectToUpdate = getThing(solidDataset, req.webID);

        if (req.name) {
            projectToUpdate = setStringNoLocale(projectToUpdate, FOAF.name, req.title);
        }
        if (req.email) {
            projectToUpdate = setStringNoLocale(projectToUpdate, FOAF.email, req.description);
        }
        if (req.org) {
            projectToUpdate = setUrl(projectToUpdate, `https://w3id.org/dpv#Organisation`, `https://w3id.org/dpv#${req.org}`);
        }
        if (req.dataSource) {
            projectToUpdate = setUrl(projectToUpdate, `${user}#dataSource`, req.dataSource);
        }
        if (req.description) {
            projectToUpdate = setStringNoLocale(projectToUpdate, DCTERMS.description, req.description);
        }

        solidDataset = setThing(solidDataset, projectToUpdate);
        await saveGivenSolidDataset(req.datasetURL, solidDataset, session);
    },

    getMemberCount: async function (session) {
        const datasetUrl = memberURL;
        const solidDataset = await getGivenSolidDataset(datasetUrl, session);

        const users = getThingAll(solidDataset);
        console.log(users.length);
        let memberCount = 0;

        for (const user of users) {
            const userType = getUrl(user, "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/user#hasUserType");
            if (userType === "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/user#Member") {
                memberCount++;
            }
        }

        return memberCount;
    },

    addNewData: async function (fileURL, appSession, userSessionID) {
        try {
            const userSession = getSessionFromStorage(userSessionID);
            const file = await getFile(fileURL, userSession.fetch);

            console.log(`Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}.`);
            console.log(`The file is ${isRawData(file) ? "not " : ""}a dataset.`);

            const fileHash = await Transformer.hashFileURL(fileURL);
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const csvText = new TextDecoder().decode(data);
            const updatedCsvText = Transformer.addColumnToCSV(csvText, "identifier", fileHash);

            // Append the updated data to the existing CSV file in the SOLID pod
            const existingFile = await getFile(resourceURL, appSession.fetch);
            const existingArrayBuffer = await existingFile.arrayBuffer();
            const existingData = new Uint8Array(existingArrayBuffer);
            const existingCsvText = new TextDecoder().decode(existingData);

            const appendedCsvText = existingCsvText + '\n' + updatedCsvText;
            const appendedData = new TextEncoder().encode(appendedCsvText);

            const updatedFile = new File([appendedData], resourceURL, { type: 'text/csv' });
            await saveFileToPod(updatedFile, resourceURL);

            console.log(`Appended CSV data has been saved to ${resourceURL}.`);

        } catch (error) {
            console.log(error);
        }
    },

    removeData: async function (fileURL, session) {
        try {
            const fileHash = await Transformer.hashFileURL(fileURL);

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
                const updatedData = new TextEncoder().encode(updatedCsvText);
                const updatedFile = new File([updatedData], resourceURL, { type: 'text/csv' });
                await saveFileToPod(updatedFile, resourceURL);
            } else {
                console.log(`No data found for the hashed identifier: ${hashedIdentifier}`);
                return null;
            }
        } catch (error) {
            console.log(error);
        }
    },
}

