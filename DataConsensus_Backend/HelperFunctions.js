const {
    saveSolidDatasetAt,
    getSolidDataset
} = require("@inrupt/solid-client");
const membersList = process.env.MEMBER_LIST
const thirdPartiesList = process.env.THIRDPARTY_LIST
const adminsList = process.env.ADMIN_LIST
const requestsList = process.env.REQUESTS
const offersList = process.env.OFFERS
const agreementsList = process.env.AGREEMENTS

async function getGivenSolidDataset(datasetURL, session) {
    return await getSolidDataset(datasetURL, { fetch: session.fetch, headers: { Accept: 'text/turtle' } }); //
}

async function saveGivenSolidDataset(datasetURL, courseSolidDataset, session) {
    await saveSolidDatasetAt(
        datasetURL,
        courseSolidDataset,
        { fetch: session.fetch, headers: { Accept: 'text/turtle' } }
    );
}

function getDatasetUrl(userType) {
    let datasetURL;
    switch (userType) {
        case 'MEMBER':
            datasetURL = membersList;
            break;
        case 'THIRDPARTY':
            datasetURL = thirdPartiesList;
            break;
        case 'ADMIN':
            datasetURL = adminsList;
            break;
        case 'REQUEST':
            datasetURL = requestsList;
            break;
        case 'OFFER':
            datasetURL = offersList;
            break;
        case 'AGREEMENT':
            datasetURL = agreementsList;
            break;
    }
    return datasetURL;
}

function extractTerm(URL) {
    const hashIndex = URL.lastIndexOf("#");
    const extractedValue = URL.substring(hashIndex + 1);
    return extractedValue;
}

function getPolicyType(policyURL) {
    const policyDataset = getDataset(policyURL);
    let type
    switch (policyDataset) {
        case offersList:
            type = 'OFFER';
            break;
        case requestsList:
            type = 'REQUEST';
            break;
        case agreementsList:
            type = 'AGREEMENT';
            break;
    }
    return type;
}

function getDataset(policyURL) {
    parts = policyURL.split("#");
    return parts[0];
}

function isDatetimePassed(datetime) {
    const inputDatetime = new Date(datetime);
    const currentDatetime = new Date();
    return inputDatetime < currentDatetime;
}


module.exports = { getGivenSolidDataset, saveGivenSolidDataset, getDatasetUrl, extractTerm, getDataset, getPolicyType, isDatetimePassed };