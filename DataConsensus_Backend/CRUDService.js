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
const csvtojson = require("csvtojson"); // To convert CSV to JSON
const N3 = require('n3'); // To convert JSON to Turtle format

const { addMemberData } = require(".logic/MemberLogic.js");

const user = process.env.USER;
const policy = process.env.POLICY;
const project = process.env.PROJECT;
const comment = process.env.COMMENT;
const vote = process.env.VOTE;
const memberURL = process.env.MEMBER_LIST;
const thirdPartyURL = process.env.THIRDPARTY_LIST;
const adminURL = process.env.ADMIN_LIST;
const requestsURL = process.env.REQUESTS
const offersURL = process.env.OFFERS
const agreementsURL = process.env.AGREEMENTS
const commentURL = process.env.COMMENTS
const votesURL = process.env.VOTES
const projectsURL = process.env.PROJECTS
const dpv = "https://w3id.org/dpv#"
const odrl = "http://www.w3.org/ns/odrl/2/"
const oac = "https://w3id.org/oac/"
const resourceURL = process.env.RESOURCE_URL;

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

function getPolicyType(URL) {
    const segments = URL.split("/");
    const filename = segments[segments.length - 1];
    const policyType = filename.split(".")[0]; // Splits the filename on the period and gets the first part ("offers")
    return policyType;
}

function generateID(solidDataset) {
    let array = getThingAll(solidDataset);
    let ID = array.length + 2;
    return ID;
}

module.exports = {

    /* USER RELATED FUNCTIONS */

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
            .addUrl(rdf.type, `${user}#User`)
            .addStringNoLocale(foaf.name, req.name)
            .addUrl(`${user}#hasUserType`, `${user}#Member`) // specifying USER TYPE (Member, ThirdParty, Admin)
            .addUrl(`${user}#dataSource`, req.DataSource) // specifying datasource
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
            .addUrl(rdf.type, `${user}#User`)
            .addStringNoLocale(foaf.email, "research@tcd.ie")
            .addStringNoLocale(foaf.name, "Trinity College Dublin")
            .addUrl(`${user}#hasUserType`, `${user}#ThirdParty`)
            .addUrl("https://w3id.org/dpv#Organisation", `https://w3id.org/dpv#${req.org}`)
            .addStringNoLocale(DCTERMS.description, req.description)
            .build();

        solidDataset = setThing(solidDataset, newThirdParty);
        //saving user details
        this.saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    getMemberCount: async function (sessionID) {
        const session = await getSessionFromStorage(sessionID);
        const datasetUrl = memberURL;

        // Fetch the dataset from the POD
        const solidDataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });

        // Get all the users in the dataset
        const users = getThingAll(solidDataset);

        let memberCount = 0;

        for (const user of users) {
            const userType = getUrl(user, "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/user#hasUserType");
            if (userType === "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/user#Member") {
                memberCount++;
            }
        }

        return memberCount;
    },

    /* POLICY RELATED FUNCTIONS */

    getPolicy: async function (policyURL, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let datasetURL = getDatasetUrl(getPolicyType(policyURL));

        const solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
        const policy = await getThing(solidDataset, policyURL);

        if (policy) {
            return policy;
        }
        return null;
    },

    getPolicies: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let datasetURL = getDatasetUrl(req.type);

        const solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
        const policies = await getThingAll(solidDataset);

        if (policies) {
            return policies;
        }
        return null;
    },

    createPolicy: async function (req, sessionID) {

        session = await getSessionFromStorage(sessionID);

        let datasetURL = getDatasetUrl(req.type);
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        // current year
        let year = date_ob.getFullYear();
        let currentDate = year + "-" + month + "-" + date;

        let creator = req.creator;
        let assigner = req.assigner;
        let assignee = req.assignee;
        let purpose = req.purpose;
        let sellingData = req.sellingData;
        let sellingInsights = req.sellingInsights;
        let organisation = req.organisation;
        let technicalMeasures = req.technicalMeasures;
        let organisationalMeasures = req.organisationalMeasures;
        let recipients = req.recipients;
        let untilTimeDuration = req.untilTimeDuration;
        let thirdPartyApproved = req.thirdPartyApproved;
        let memberApproved = req.memberApproved;
        let adminApproved = req.adminApproved;
        let project = req.project;

        let measuresArray = [];
        technicalMeasures.forEach(function (value) {
            if (value.completed) {
                measuresArray.push(value.name);
            }
        });
        organisationalMeasures.forEach(function (value) {
            if (value.completed) {
                measuresArray.push(value.name);
            }
        });
        let recipientsArray = [];
        recipients.forEach(function (value) {
            if (value.completed) {
                recipientsArray.push(value.name);
            }
        });

        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
        let policyID = generateID(solidDataset);

        const organisationConstraint = buildThing(createThing())
            .addUrl(`${odrl}#leftOperand`, `${oac}#Organisation`)
            .addUrl(`${odrl}#operator`, `${odrl}#isA`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${organisation}`)
            .build();

        const durationConstraint = buildThing(createThing())
            .addUrl(`${odrl}#leftOperand`, `${dpv}#UntilTimeDuration`)
            .addUrl(`${odrl}#operator`, `${odrl}#eq`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${untilTimeDuration}`)
            .build();

        let newConstraint = buildThing(createThing())
            .addUrl(`${odrl}#and`, purposeConstraint)
            .addUrl(`${odrl}#and`, organisationConstraint)
            .addUrl(`${odrl}#and`, durationConstraint);

        const purposeConstraint = buildThing(createThing())
            .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
            .addUrl(`${odrl}#operator`, `${odrl}#isA`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${purpose}`)
            .build();

        let sellingDataConstraint = buildThing(createThing())
        if (sellingData) {
            sellingDataConstraint = sellingDataConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellDataToThirdParties}`);
        }
        else {
            sellingDataConstraint = sellingDataConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isNotA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellDataToThirdParties`);
        }
        sellingDataConstraint = sellingDataConstraint.build();
        newConstraint = newConstraint.addUrl(`${odrl}#and`, sellingDataConstraint);

        let sellingInsightsConstraint = buildThing(createThing())
        if (sellingInsights) {
            sellingInsightsConstraint = sellingInsightsConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellInsightsFromData`);
        }
        else {
            sellingInsightsConstraint = sellingInsightsConstraint
                .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
                .addUrl(`${odrl}#operator`, `${odrl}#isNotA`)
                .addUrl(`${odrl}#rightOperand`, `${dpv}#SellInsightsFromData`);
        }
        sellingInsightsConstraint = sellingInsightsConstraint.build();
        newConstraint = newConstraint.addUrl(`${odrl}#and`, sellingInsightsConstraint);

        if (measuresArray.length > 0) {
            let techOrgMeasureConstraint = buildThing(createThing())
                .addUrl(`${odrl}#leftOperand`, `${oac}#TechnicalOrganisationalMeasure`)
                .addUrl(`${odrl}#operator`, `${odrl}#isAllOf`)
                .addUrl(`${odrl}#rightOperand`, organisation)

            measuresArray.forEach((measure) => {
                techOrgMeasureConstraint = techOrgMeasureConstraint.addUrl(`${odrl}#rightOperand`, measure);
            });

            techOrgMeasureConstraint = techOrgMeasureConstraint.build();
            newConstraint = newConstraint.addUrl(`${odrl}#and`, techOrgMeasureConstraint);
        }
        if (recipientsArray.length > 0) {
            let recipientConstraint = buildThing(createThing())
                .addUrl(`${odrl}#leftOperand`, `${oac}#Recipient`)
                .addUrl(`${odrl}#operator`, `${odrl}#isAllOf`)
                .addUrl(`${odrl}#rightOperand`, recipientsArray)

            recipientsArray.forEach((item) => {
                recipientConstraint = recipientConstraint.addUrl(`${odrl}#rightOperand`, item);
            });

            recipientConstraint = recipientConstraint.build();
            newConstraint = newConstraint.addUrl(`${odrl}#and`, recipientConstraint);
        }
        newConstraint = newConstraint.build();

        const newPermission = buildThing(createThing())
            .addUrl(`${odrl}#assigner`, assigner)
            .addUrl(`${odrl}#assignee`, assignee)
            .addUrl(`${odrl}#action`, `${dpv}#Use`)
            .addUrl(`${odrl}#action`, `${dpv}#Transform`)
            .addUrl(`${odrl}#action`, `${dpv}#Copy`)
            .addUrl(`${odrl}#action`, `${dpv}#Store`)
            .addUrl(`${odrl}#action`, `${dpv}#Remove`)
            .addUrl(`${odrl}#target`, `https://w3id.org/dpv/dpv-pd#MedicalHealth`)
            .addUrl(`${odrl}#permission`, newConstraint)
            .build();

        let newPolicy = buildThing(createThing({ name: `${datasetURL}#${policyID}` }))
            .addUrl(rdf_type, `${odrl}#${req.type}`)
            .addUrl(DCTERMS.creator, creator)
            .addStringNoLocale(DCTERMS.issued, currentDate)
            .addUrl(DCTERMS.isPartOf, `${projectsURL}#${project}`)
            .addUrl(`${odrl}#uid`, `${datasetURL}#${policyID}`)
            .addUrl(`${odrl}#profile`, `${oac}`)
            .addUrl(`${odrl}#permission`, newPermission);

        if (req.type == "Request" || req.type == "Offer") {
            newPolicy = newPolicy
                .addUrl(`${policy}#thirdPartyApproved`, `${policy}#${thirdPartyApproved}`)
                .addUrl(`${policy}#memberApproved`, `${policy}#${memberApproved}`)
                .addUrl(`${policy}#adminApproved`, `${policy}#${adminApproved}`);
        }
        else {
            newPolicy = newPolicy
                .addUrl(DCTERMS.references, references)
                .addUrl(`${dpv}#hasDataSubject`, `${dpv}#${req.assigner}`)
                .addUrl(`${dpv}#hasJointDataController`, `${dpv}#${req.assignee}`)
                .addUrl(`${dpv}#hasJointDataController`, `${dpv}#${req.assigner}`)
                .addUrl(`${dpv}#hasLegalBasis`, `${dpv}#Consent`);

            this.updateProject(req.project, sessionID)
        }

        newPolicy = newPolicy.build();

        solidDataset = setThing(solidDataset, newPolicy);
        this.saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    updatePolicyStatus: async function (req, sessionID) {

        session = await getSessionFromStorage(sessionID);
        let datasetURL = getDatasetUrl(getPolicyType(req.policyURL));
        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));

        let policyToUpdate = getThing(solidDataset, req.policyURL);
        policyToUpdate = setUrl(policyToUpdate, `${policy}#${req.actor}`, `${policy}#${req.newStatus}`);

        solidDataset = setThing(solidDataset, policyToUpdate);
        this.saveGivenSolidDataset(datasetURL, solidDataset, session);

    },

    removePolicy: async function (policyType, agreementID, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let datasetURL = getDatasetUrl(policyType);
        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
        const policy = getThing(solidDataset, datasetURL + "#" + agreementID);

        if (policy === null) {
            throw new Error("Policy not found.");
        }
        if (policyType === "agreement") {
            const referenceURL = getUrl(policy, `${dct}#references`);
            // Check if dct:reference exists
            if (referenceURL === null) {
                throw new Error("dct:reference not found in the agreement.");
            }
            console.log("dct:reference:", referenceURL);
            let req = {
                type: getPolicyType(referenceURL),
                policyURL: referenceURL,
                actor: "adminApproved",
                newStatus: "Removed"
            };

            await updatePolicyStatus(req, sessionID);
        }

        solidDataset = removeThing(solidDataset, policy);
        this.saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    /* COMMENT RELATED FUNCTIONS */

    addComment: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let datasetURL = commentURL;
        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
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
        this.saveGivenSolidDataset(datasetURL, solidDataset, session);
    },
    moderateComment: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let datasetURL = commentURL;
        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));

        let commentToUpdate = getThing(solidDataset, `${commentURL}#${req.commentID}`);
        commentToUpdate = setUrl(commentToUpdate, `${comment}#wasModerated`, true);
        commentToUpdate = setUrl(commentToUpdate, `${comment}#hasModerator`, req.moderator);
        commentToUpdate = setUrl(commentToUpdate, DCTERMS.modified, new Date());

        solidDataset = setThing(solidDataset, commentToUpdate);
        this.saveGivenSolidDataset(datasetURL, solidDataset, session);
    },
    removeComment: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let datasetURL = commentURL;
        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));

        let commentToRemove = getThing(solidDataset, `${commentURL}#${req.commentID}`);

        solidDataset = removeThing(solidDataset, commentToRemove);

        this.saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    getCommentsByPolicy: async function (policyURL, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let datasetURL = commentURL;
        let solidDataset = await this.getGivenSolidDataset(datasetURL, session);
        let thingList = getThingAll(solidDataset);

        // filter Things to only include those that reference the provided policy URL
        let comments = thingList.filter(thing =>
            getUrl(thing, DCTERMS.references) === policyURL
        );

        return comments;
    },

    /* VOTE RELATED FUNCTIONS */

    addVote: async function (req, sessionID) {
        let session = await getSessionFromStorage(sessionID);
        let datasetURL = votesURL;
        let solidDataset = await (this.getGivenSolidDataset(datasetURL, session));

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
        this.saveGivenSolidDataset(datasetURL, solidDataset, session);
    },

    countVotesByRankPolicy: async function (req, sessionID) {
        const session = await getSessionFromStorage(sessionID);
        const datasetUrl = votesURL;
        const solidDataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });

        const things = getThingAll(solidDataset);
        let count = 0;

        for (let thing of things) {
            // Check if the vote is for the specific policy
            const policy = getUrl(thing, `${vote}#hasDocument`);
            if (policy !== req.policyUrl) {
                continue;
            }
            // Check if the vote rank matches the requested rank
            const rank = getUrl(thing, `${vote}#voteRank`);
            if (rank === req.rank) {
                count++;
            }
        }
        return count;
    },

    /* PROJECT RELATED FUNCTIONS */

    createProject: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let solidDataset = await (this.getGivenSolidDataset(projectsURL, session));
        let projectID = generateID(solidDataset);
        const newProject = createThing({ name: projectID })
            .addUrl(rdf.type, `${dct}#Project`)
            .addStringNoLocale(`${dct}#title`, req.title)
            .addStringNoLocale(`${dct}#description`, req.description)
            .addUrl(`${oac}#Organisation`, `${dpv}#${req.organisation}`)
            .addUrl(`${dct}#creator`, req.creator)
            .addInteger(`${project}#requestTime`, 7)
            .addInteger(`${project}#offerTime`, 7)
            .addInteger(`${project}#threshold`, 0.5)
            .addBoolean(`${project}#hasAgreement`, false)
            .build();

        solidDataset = setThing(solidDataset, newProject);
        this.saveGivenSolidDataset(projectsURL, solidDataset, session);
        return projectID;
    },


    updateProject: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let solidDataset = await (this.getGivenSolidDataset(projectsURL, session));
        let projectToUpdate = getThing(solidDataset, req.projectURL);

        if (req.title) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${dct}#title`, req.title);
        }
        if (req.description) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${dct}#description`, req.description);
        }
        if (req.requestTime) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#requestTime`, req.requestTime);
        }
        if (req.offerTime) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#offerTime`, req.offerTime);
        }
        if (req.threshold) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#threshold`, req.threshold);
        }
        if (req.agreememt) {
            projectToUpdate = setStringNoLocale(projectToUpdate, `${project}#hasAgreement`, true);
        }

        solidDataset = setThing(solidDataset, projectToUpdate);
        this.saveGivenSolidDataset(projectsURL, solidDataset, session);
    },

    getProjectThreshold: async function (projectUrl, sessionID) {
        const session = await getSessionFromStorage(sessionID);
        const solidDataset = await (this.getGivenSolidDataset(projectsURL, session));
        const projectThing = getThing(solidDataset, projectUrl);

        if (!projectThing) {
            throw new Error(`Project not found`);
        }

        const threshold = getDecimal(projectThing, `${project}#threshold`);
        if (threshold === null || threshold === undefined) {
            throw new Error(`Project ${projectUrl} does not have a threshold`);
        }

        return threshold;
    },

    getProjectOffers: async function (projectURL, sessionID) {
        const session = await getSessionFromStorage(sessionID);
        const solidDataset = await (this.getGivenSolidDataset(offersURL, session));
        const allOffers = getThingAll(solidDataset);

        const relevantOffers = [];

        for (const offer of allOffers) {
            const isPartOf = getStringNoLocale(offer, DCTERMS.isPartOf);
            if (isPartOf === projectURL) {
                relevantOffers.push(offer);
            }
        }
        return relevantOffers;
    },

    /* RESOURCE FUNCTION */

    createResource: async function (csv, sessionID) {
        session = await getSessionFromStorage(sessionID);

        const jsonArray = await csvtojson().fromString(csv);
        const writer = new N3.Writer({ prefixes: { dbpedia: 'http://dbpedia.org/ontology/' } });
        jsonArray.forEach((item) => {
            writer.addQuad(
                writer.blankNode(),
                writer.iri('http://dbpedia.org/ontology/' + item.property),
                writer.literal(item.value, 'http://www.w3.org/2001/XMLSchema#string')
            );
        });
        let turtleDocument;
        writer.end((error, result) => { turtleDocument = result; });

        const newResource = createSolidDataset();
        newResource.add(turtleDocument);
        this.saveGivenSolidDataset(resourceURL, solidDataset, session);
        return savedDataset;
    },

    /* HELPER FUNCTIONS */

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
}

