require("dotenv").config();
const {
    addUrl,
    addStringNoLocale,
    buildThing,
    createSolidDataset,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getSolidDataset,
} = require("@inrupt/solid-client");
const { getSessionFromStorage } = require("@inrupt/solid-client-authn-node");
const { SCHEMA_INRUPT, RDF, FOAF, DCTERMS } = require("@inrupt/vocab-common-rdf");

const { addMemberData } = require(".logic/MemberLogic.js");

const usertypes = process.env.USER_TYPES;
const memberURL = process.env.MEMBER_LIST;
const thirdPartyURL = process.env.THIRDPARTY_LIST;
const adminURL = process.env.ADMIN_LIST;
const requestsURL = process.env.REQUESTS
const offersURL = process.env.OFFERS
const counterOffersURL = process.env.COUNTER_OFFERS
const draftOffersURL = process.env.DRAFT_OFFERS
const agreementsURL = process.env.AGREEMENTS
const commentURL = process.env.COMMENTS

module.exports = {
    checkUser: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let datasetURL = memberURL;
        if (req.type == "MEMBER") {
            datasetURL = memberURL;
        }
        else if (req.type == "THIRDPARTY") {
            datasetURL = thirdPartyURL;
        }
        else {
            datasetURL = adminURL;
        }

        const solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
        const user = getThing(solidDataset, datasetURL + "#" + req.webId);

        if (user) {
            return true;
        }
        return false;
    },

    addMember: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let solidDataset = await (this.getGivenSolidDataset(memberURL, session));

        //building user details as thing
        const newMember = buildThing(createThing({ name: req.webId }))
            .addUrl(rdf.type, `${usertypes}#User`)
            .addStringNoLocale(foaf.name, req.name)
            .addUrl(`${usertypes}#hasUserType`, `${usertypes}#Member`) // specifying USER TYPE (Member, ThirdParty, Admin)
            .addUrl(`${usertypes}#dataSource`, req.DataSource) // specifying datasource
            .build();

        addMemberData();

        solidDataset = setThing(solidDataset, newMember);
        //saving user details
        this.saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    addThirdParty: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let solidDataset = await (this.getGivenSolidDataset(thirdPartyURL, session));

        const newThirdParty = buildThing(createThing({ name: req.webId }))
            .addUrl(rdf.type, `${usertypes}#User`)
            .addStringNoLocale(foaf.email, "research@tcd.ie")
            .addStringNoLocale(foaf.name, "Trinity College Dublin")
            .addUrl(`${usertypes}#hasUserType`, `${usertypes}#ThirdParty`)
            .addUrl("https://w3id.org/dpv#Organisation", `https://w3id.org/dpv#${req.org}`)
            .addStringNoLocale(DCTERMS.description, req.description)
            .build();

        solidDataset = setThing(solidDataset, newThirdParty);
        //saving user details
        this.saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    submitCompanyRequest: async function (req, sessionID) {

        session = await getSessionFromStorage(sessionID);
        let dataseturl = CONSTANTS.COMPANY_REQUESTS;
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        // current year
        let year = date_ob.getFullYear();
        let currentDate = year + "-" + month + "-" + date;
        let purposeFullData = req.purpose.subtasks;
        let purposes = [];
        purposeFullData.forEach(function (value) {
            if (value.completed) {
                purposes.push(value.name);
            }
        });


        let courseSolidDataset = await (this.getGivenSolidDataset(requestsURL, session));
        let count = getThing(courseSolidDataset, requestsURL + "#requestCount");

        //string literal is given as output

        let requestCount;
        if (count) {
            count = count.predicates["http://purl.org/ontology/mo/record_count"]
                .literals["http://www.w3.org/2001/XMLSchema#integer"][0];
            count = parseInt(count);
            count = count + 1;
            requestCount = buildThing(createThing({ name: "requestCount" }))
                .addUrl(RDF.type, "http://www.w3.org/2003/11/swrl#Variable")
                .addInteger("http://purl.org/ontology/mo/record_count", count).build();
        }
        else {
            count = 1;
            requestCount = buildThing(createThing({ name: "requestCount" }))
                .addUrl(RDF.type, "http://www.w3.org/2003/11/swrl#Variable")
                .addInteger("http://purl.org/ontology/mo/record_count", 1).build();

        }

        if (req.requestedBy == '') {
            req.requestedBy = "https://asegroup.inrupt.net/profile/card#me"
        }
        let timevoteGroup = buildThing({ name: "http://example.com" + "#timepeopleVoted" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://d-nb.info/standards/elementset/gnd#GroupOfPersons")
            .build();
        let purposevoteGroup = buildThing({ name: "http://example.com" + "#purposepeopleVoted" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://d-nb.info/standards/elementset/gnd#GroupOfPersons")
            .build();
        let historyvoteGroup = buildThing({ name: "http://example.com" + "#historypeopleVoted" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://d-nb.info/standards/elementset/gnd#GroupOfPersons")
            .build();
        let datasellvoteGroup = buildThing({ name: "http://example.com" + "#datasellpeopleVoted" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://d-nb.info/standards/elementset/gnd#GroupOfPersons")
            .build();
        let copyvoteGroup = buildThing({ name: "http://example.com" + "#datacopyvoteGroup" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://d-nb.info/standards/elementset/gnd#GroupOfPersons")
            .build();



        let timevoteThing = buildThing({ name: "http://example.com" + "#timevoteDetails" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Thing")
            .addInteger("http://schema.org/upvoteCount", 0)
            .addInteger("http://schema.org/downvoteCount", 0)
            .addUrl("http://d-nb.info/standards/elementset/gnd#GroupOfPersons", timevoteGroup)
            .build();
        let purposeVoteThing = buildThing({ name: "http://example.com" + "#purposevoteDetails" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Thing")
            .addInteger("http://schema.org/upvoteCount", 0)
            .addInteger("http://schema.org/downvoteCount", 0)
            .addUrl("http://d-nb.info/standards/elementset/gnd#GroupOfPersons", purposevoteGroup)
            .build();
        let copyVoteThing = buildThing({ name: "http://example.com" + "#copyVoteDetails" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Thing")
            .addInteger("http://schema.org/upvoteCount", 0)
            .addInteger("http://schema.org/downvoteCount", 0)
            .addUrl("http://d-nb.info/standards/elementset/gnd#GroupOfPersons", copyvoteGroup)
            .build();
        let historyVoteThing = buildThing({ name: "http://example.com" + "#historyVoteDetails" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Thing")
            .addInteger("http://schema.org/upvoteCount", 0)
            .addInteger("http://schema.org/downvoteCount", 0)
            .addUrl("http://d-nb.info/standards/elementset/gnd#GroupOfPersons", historyvoteGroup)
            .build();
        let thirdpartyVoteThing = buildThing({ name: "http://example.com" + "#sellDataVoteDetails" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Thing")
            .addInteger("http://schema.org/upvoteCount", 0)
            .addInteger("http://schema.org/downvoteCount", 0)
            .addUrl("http://d-nb.info/standards/elementset/gnd#GroupOfPersons", datasellvoteGroup)
            .build();

        //dummy single constraint
        let purposeConstraint = buildThing({ name: "http://example.com" + "#purposeConstraint" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Constraint")
            .addUrl("http://www.w3.org/ns/odrl/2/leftOperand", "https://w3id.org/oac/Purpose")
            .addUrl("http://www.w3.org/2002/07/owl#Thing", purposeVoteThing)
            .build();

        if (purposes.length == 1) {
            let urlPurpose;
            if (purposes[0] == "Research") {
                urlPurpose = "https://w3id.org/dpv#ResearchAndDevelopment";
            }
            else {
                urlPurpose = "https://w3id.org/dpv#ServiceUsageAnalytics";
            }
            purposeConstraint = buildThing(purposeConstraint)
                .addUrl("http://www.w3.org/ns/odrl/2/operator", "http://www.w3.org/ns/odrl/2/isA")
                .addUrl("http://www.w3.org/ns/odrl/2/rightOperand", urlPurpose)
                .build();
        }
        else if (purposes.length > 1) {
            purposeConstraint = buildThing(purposeConstraint)
                .addUrl("http://www.w3.org/ns/odrl/2/operator", "http://www.w3.org/ns/odrl/2/isAnyOf")
                .addUrl("http://www.w3.org/ns/odrl/2/rightOperand", "https://w3id.org/dpv#ResearchAndDevelopment")
                .addUrl("http://www.w3.org/ns/odrl/2/rightOperand", "https://w3id.org/dpv#ServiceUsageAnalytics")
                .build();
        }

        let d = new Date(req.selectedDate);

        let timeConstraintThing = buildThing({ name: "http://example.com" + "#timeConstraintThing" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Constraint")
            .addUrl("http://www.w3.org/ns/odrl/2/leftOperand", "http://www.w3.org/ns/odrl/2/dateTime")
            .addUrl("http://www.w3.org/ns/odrl/2/operator", "http://www.w3.org/ns/odrl/2/lteq")
            .addDate("http://www.w3.org/ns/odrl/2/rightOperand", new Date(req.selectedDate))
            .addUrl("http://www.w3.org/2002/07/owl#Thing", timevoteThing)
            .build();

        let constraintThing = buildThing({ name: "http://example.com" + "#constraint" + count })
            .addUrl("http://www.w3.org/ns/odrl/2/and", purposeConstraint)
            .addUrl("http://www.w3.org/ns/odrl/2/and", timeConstraintThing)
            .build();

        var permissionThing = buildThing({ name: "http://example.com" + "#permission" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Permission")
            .addUrl("http://www.w3.org/ns/odrl/2/assigner", req.requestedBy)
            .addUrl("http://www.w3.org/ns/odrl/2/target", "https://w3id.org/oac/Contact")
            .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Read")
            .addUrl("http://www.w3.org/2002/07/owl#Thing", copyVoteThing)
            .addUrl("http://www.w3.org/2002/07/owl#Thing", historyVoteThing)
            .addUrl("http://www.w3.org/2002/07/owl#Thing", thirdpartyVoteThing)
            .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Write").build();


        if (req.isCopied) {
            permissionThing = buildThing(permissionThing)
                .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Copy")
                .build();
        }
        if (req.historyOfData) {
            permissionThing = buildThing(permissionThing)
                .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Record")
                .build();
        }
        if (req.dataSelling) {
            permissionThing = buildThing(permissionThing)
                .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/sell")
                .build();
        }
        permissionThing = buildThing(permissionThing)
            .addUrl("http://www.w3.org/ns/odrl/2/constraint", constraintThing)
            .build();

        let commentThing = buildThing({ name: "http://example.com" + "#commentThing" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/comment")
            .build();

        let dataAccessRequestThing = buildThing({ name: "http://example.com" + "#policy" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Policy")
            .addUrl("http://www.w3.org/ns/odrl/2/profile", "https://w3id.org/oac/")
            .addUrl("http://www.w3.org/ns/odrl/2/Permission", permissionThing)
            .addStringNoLocale("http://purl.org/dc/terms/created", currentDate)
            .addUrl("http://schema.org/comment", commentThing)
            .build();

        let currentCompRequestThing = getThing(courseSolidDataset, requestsURL + "#" + "http://example.com/companyrequests");
        let newRequest;
        if (currentCompRequestThing) {
            newRequest = buildThing(currentCompRequestThing)
                .addUrl("http://example.com/requests", dataAccessRequestThing)
                .build();
        }
        else {
            newRequest = buildThing(createThing({ name: "http://example.com/companyrequests" }))
                .addUrl("http://example.com/requests", dataAccessRequestThing)
                .build();
        }
        courseSolidDataset = setThing(courseSolidDataset, requestCount);
        courseSolidDataset = setThing(courseSolidDataset, newRequest);
        courseSolidDataset = setThing(courseSolidDataset, dataAccessRequestThing);
        courseSolidDataset = setThing(courseSolidDataset, permissionThing);
        courseSolidDataset = setThing(courseSolidDataset, constraintThing);
        courseSolidDataset = setThing(courseSolidDataset, purposeConstraint);
        courseSolidDataset = setThing(courseSolidDataset, timeConstraintThing);
        courseSolidDataset = setThing(courseSolidDataset, commentThing);

        // vote things
        courseSolidDataset = setThing(courseSolidDataset, timevoteThing);
        courseSolidDataset = setThing(courseSolidDataset, purposeVoteThing);
        courseSolidDataset = setThing(courseSolidDataset, historyVoteThing);
        courseSolidDataset = setThing(courseSolidDataset, thirdpartyVoteThing);
        courseSolidDataset = setThing(courseSolidDataset, historyVoteThing);

        // vote groups
        courseSolidDataset = setThing(courseSolidDataset, timevoteGroup);
        courseSolidDataset = setThing(courseSolidDataset, historyvoteGroup);
        courseSolidDataset = setThing(courseSolidDataset, datasellvoteGroup);
        courseSolidDataset = setThing(courseSolidDataset, thirdpartyVoteThing);
        courseSolidDataset = setThing(courseSolidDataset, purposevoteGroup);

        this.saveGivenSolidDataset(CONSTANTS.COMPANY_REQUESTS,
            courseSolidDataset, session)
    },

    // METHOD TO FETCH THE DATASET
    getGivenSolidDataset: async function (datasetURL, session) {
        return await getSolidDataset(datasetURL, { fetch: session.fetch });
    },

    saveGivenSolidDataset: async function (datasetURL, courseSolidDataset, session) {
        const savedSolidDataset = await saveSolidDatasetAt(
            datasetURL,
            courseSolidDataset,      // fetch from authenticated Session
            { fetch: session.fetch }
        );
    },

    getAllCompanyRequests: async function (sessionId) {
        session = await getSessionFromStorage(sessionId);
        return await this.getGivenSolidDataset(CONSTANTS.COMPANY_REQUESTS, session);
    }
}

