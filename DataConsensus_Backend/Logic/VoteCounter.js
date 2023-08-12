require("dotenv").config();
const { RDF, DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const policyService = require("../CRUDService/PolicyService.js");
const userService = require("../CRUDService/UserService.js");
const voteService = require("../CRUDService/VoteService.js");
const { isDatetimePassed } = require("../HelperFunctions.js");
const offersList = process.env.OFFERS
const requestsList = process.env.REQUESTS
const projectsList = process.env.PROJECTS
const projectSchema = process.env.PROJECT;

module.exports = {
    calculateBinaryVotes: async function (projectRequests, appSession) {
        const date = projectRequests[0].requestEndTime;
        if (isDatetimePassed(date)) {
            const policyURL = projectRequests[0].URL;
            const upvotes = await voteService.countVotesByRankPolicy(
                { policyURL: policyURL, rank: 1 },
                appSession);
            const downvotes = await voteService.countVotesByRankPolicy(
                { policyURL: policyURL, rank: 2 },
                appSession);
            const membersNumber = await userService.getMemberCount(date, appSession);
            const abstention = membersNumber - (upvotes + downvotes);

            const threshold = projectRequests[0].threshold;
            let result = false;
            if (upvotes > Math.ceil(membersNumber * threshold)) {
                result = true;
            }
            return { result, upvotes, downvotes, abstention, membersNumber, threshold };
        } else {
            return { error: "requestEndTime is not passed yet" }
        }
    },

    calculatePreferenceVotes: async function (project, projectOffers, appSession) {
        const date = project.predicates[`${projectSchema}#offerEndTime`]["literals"][XSD.dateTime][0];
        if (isDatetimePassed(date) && projectOffers.length > 0) {
            const membersNumber = await userService.getMemberCount(date, appSession);
            const threshold = project.predicates[`${projectSchema}#threshold`]["literals"][XSD.decimal][0];
            let results = [];
            let winner = `rejection`;
            for (const offer of projectOffers) {
                const firstPreference = await voteService.countVotesByRankPolicy(
                    { policyURL: offer.URL, rank: 1 },
                    appSession);
                results.push({ policyUrl: offer.URL, count: firstPreference });
            }
            const rejectVote = await voteService.countVotesByRankPolicy({ policyURL: `${offersList}#rejection`, rank: 1 }, appSession);
            results.push({ policyUrl: `${offersList}#rejection`, count: rejectVote });
            const sortedResults = results.sort((a, b) => b.count - a.count);
            const totalCount = sortedResults.reduce((total, policy) => total + policy.count, 0);
            const cutoff = Math.ceil(membersNumber * threshold);
            if (sortedResults[0].count > cutoff) {
                winner = sortedResults[0].policyUrl;
            }
            return { sortedResults, winner, totalCount, cutoff, membersNumber, threshold };
        } else {
            return { error: "offerEndTime has not passed yet or no offer to deliberate occured" }
        }
    }
};