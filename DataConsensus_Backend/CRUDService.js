require("dotenv").config();
const {
    addUrl,
    addStringNoLocale,
    buildThing,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getSolidDataset,
    getFile,
    isRawData,
    getContentType,
    getSourceUrl
} = require("@inrupt/solid-client");
const { getSessionFromStorage } = require("@inrupt/solid-client-authn-node");
const { FOAF, DCTERMS } = require("@inrupt/vocab-common-rdf");
const Transformer = require('./Logic/Transformer');

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

    checkUserByType: async function (req, sessionID) {
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

    checkUser: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let datasetURLs = [memberURL, thirdPartyURL, adminURL];
        for (const datasetURL of datasetURLs) {
            const solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
            const user = getThing(solidDataset, datasetURL + "#" + req.webId);
            if (user) {
                return datasetURL;
            }
        }
        if (!user) {
            return false;
        }
    },

    addMember: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let solidDataset = await (this.getGivenSolidDataset(memberURL, session));

        //building user details as thing
        const newMember = buildThing(createThing({ name: req.webId }))
            .addUrl(rdf.type, `${user}#User`)
            .addStringNoLocale(FOAF.name, req.name)
            .addUrl(`${user}#hasUserType`, `${user}#Member`) // specifying USER TYPE (Member, ThirdParty, Admin)
            .addUrl(`${user}#dataSource`, req.dataSource) // specifying datasource
            .build();

        solidDataset = setThing(solidDataset, newMember);
        this.saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    addThirdParty: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);

        let solidDataset = await (this.getGivenSolidDataset(thirdPartyURL, session));

        const newThirdParty = buildThing(createThing({ name: req.webId }))
            .addUrl(rdf.type, `${user}#User`)
            .addStringNoLocale(FOAF.email, req.email)
            .addStringNoLocale(FOAF.name, req.name)
            .addUrl(`${user}#hasUserType`, `${user}#ThirdParty`)
            .addUrl("https://w3id.org/dpv#Organisation", `https://w3id.org/dpv#${req.org}`)
            .addStringNoLocale(DCTERMS.description, req.description)
            .build();

        solidDataset = setThing(solidDataset, newThirdParty);
        this.saveGivenSolidDataset(memberURL, solidDataset, session);
    },

    getUser: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let datasetURL = req.userType;
        const solidDataset = await (this.getGivenSolidDataset(datasetURL, session));
        const user = getThing(solidDataset, datasetURL + "#" + req.webId);
        return user;
    },

    updateUser: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let solidDataset = await (this.getGivenSolidDataset(req.datasetURL, session));
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
        this.saveGivenSolidDataset(req.datasetURL, solidDataset, session);
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

        let creator = req.creator;
        let assigner = req.assigner;
        let assignee = req.assignee;
        let purpose = req.purpose;
        let sellingData = req.sellingData;
        let sellingInsights = req.sellingInsights;
        let organisation = req.organisation;
        let techOrgMeasures = req.techOrgMeasures;
        let recipients = req.recipients;
        let untilTimeDuration = req.untilTimeDuration;
        let project = req.project;

        let measuresArray = [];
        techOrgMeasures.forEach(function (value) {
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

        const organisationConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_organisationConstraint` }))
            .addUrl(`${odrl}#leftOperand`, `${oac}#Organisation`)
            .addUrl(`${odrl}#operator`, `${odrl}#isA`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${organisation}`)
            .build();

        const durationConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_durationConstraint` }))
            .addUrl(`${odrl}#leftOperand`, `${dpv}#UntilTimeDuration`)
            .addUrl(`${odrl}#operator`, `${odrl}#eq`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${untilTimeDuration}`)
            .build();

        const purposeConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_purposeConstraint` }))
            .addUrl(`${odrl}#leftOperand`, `${oac}#Purpose`)
            .addUrl(`${odrl}#operator`, `${odrl}#isA`)
            .addUrl(`${odrl}#rightOperand`, `${dpv}#${purpose}`)
            .build();

        solidDataset = setThing(solidDataset, organisationConstraint);
        solidDataset = setThing(solidDataset, durationConstraint);
        solidDataset = setThing(solidDataset, purposeConstraint);

        let sellingDataConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_sellingDataConstraint` }))
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
        solidDataset = setThing(solidDataset, sellingDataConstraint);

        let sellingInsightsConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_sellingInsightsConstraint` }))
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
        solidDataset = setThing(solidDataset, sellingInsightsConstraint);

        if (measuresArray.length > 0) {
            let techOrgMeasureConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_techOrgMeasureConstraint` }))
                .addUrl(`${odrl}#leftOperand`, `${oac}#TechnicalOrganisationalMeasure`)
                .addUrl(`${odrl}#operator`, `${odrl}#isAllOf`)
                .addUrl(`${odrl}#rightOperand`, organisation)

            measuresArray.forEach((measure) => {
                techOrgMeasureConstraint = techOrgMeasureConstraint.addUrl(`${odrl}#rightOperand`, measure);
            });

            techOrgMeasureConstraint = techOrgMeasureConstraint.build();
            solidDataset = setThing(solidDataset, techOrgMeasureConstraint);
        }
        if (recipientsArray.length > 0) {
            let recipientConstraint = buildThing(createThing({ name: `${datasetURL}#${policyID}_recipientConstraint` }))
                .addUrl(`${odrl}#leftOperand`, `${oac}#Recipient`)
                .addUrl(`${odrl}#operator`, `${odrl}#isAllOf`)
                .addUrl(`${odrl}#rightOperand`, recipientsArray)

            recipientsArray.forEach((item) => {
                recipientConstraint = recipientConstraint.addUrl(`${odrl}#rightOperand`, item);
            });
            recipientConstraint = recipientConstraint.build();
            solidDataset = setThing(solidDataset, recipientConstraint);
        }

        const newPermission = buildThing(createThing({ name: `${datasetURL}#${policyID}_permission` }))
            .addUrl(`${odrl}#assigner`, assigner)
            .addUrl(`${odrl}#assignee`, assignee)
            .addUrl(`${odrl}#action`, `${dpv}#Use`)
            .addUrl(`${odrl}#action`, `${dpv}#Transform`)
            .addUrl(`${odrl}#action`, `${dpv}#Copy`)
            .addUrl(`${odrl}#action`, `${dpv}#Store`)
            .addUrl(`${odrl}#action`, `${dpv}#Remove`)
            .addUrl(`${odrl}#target`, `https://w3id.org/dpv/dpv-pd#MedicalHealth`)
            .addUrl(`${odrl}#constraint`,
                `${datasetURL}#${policyID}_organisationConstraint`,
                `${datasetURL}#${policyID}_durationConstraint`,
                `${datasetURL}#${policyID}_purposeConstraint`,
                `${datasetURL}#${policyID}_sellingDataConstraint`,
                `${datasetURL}#${policyID}_sellingInsightsConstraint`,
                `${datasetURL}#${policyID}_techOrgMeasureConstraint`,
                `${datasetURL}#${policyID}_recipientConstraint`)
            .build();

        solidDataset = setThing(solidDataset, newPermission);

        let newPolicy = buildThing(createThing({ name: `${datasetURL}#${policyID}` }))
            .addUrl(rdf_type, `${odrl}#${req.type}`)
            .addUrl(DCTERMS.creator, creator)
            .addStringNoLocale(DCTERMS.issued, new Date())
            .addUrl(DCTERMS.isPartOf, `${projectsURL}#${project}`)
            .addUrl(`${odrl}#uid`, `${datasetURL}#${policyID}`)
            .addUrl(`${odrl}#profile`, `${oac}`)
            .addUrl(`${odrl}#permission`, `${datasetURL}#${policyID}_permission`);

        if (req.type == "Request" || req.type == "Offer") {
            let thirdPartyApproved = req.thirdPartyApproved;
            let memberApproved = req.memberApproved;
            let adminApproved = req.adminApproved;
            newPolicy = newPolicy
                .addUrl(`${policy}#thirdPartyApproved`, `${policy}#${thirdPartyApproved}`)
                .addUrl(`${policy}#memberApproved`, `${policy}#${memberApproved}`)
                .addUrl(`${policy}#adminApproved`, `${policy}#${adminApproved}`);
        }
        else {
            let references = req.references;
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

    addNewData: async function (fileURL, appSessionID, userSessionID) {
        try {
            const userSession = await getSessionFromStorage(userSessionID);
            const appSession = await getSessionFromStorage(appSessionID);

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

    removeData: async function (fileURL, fetch) {
        try {
            const fileHash = await Transformer.hashFileURL(fileURL);

            const file = await getFile(
                resourceURL,
                { fetch: fetch }
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
    }
}

