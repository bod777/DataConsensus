const router = require("express").Router();
const { Comment } = require("../Models/Comment.js");
const voteService = require("../CRUDService/VoteService.js");
const policyService = require("../CRUDService/PolicyService.js");
const userService = require("../CRUDService/UserService.js");
const { getPolicyDataset } = require("../HelperFunctions.js");
const { Request, Offer } = require("../Models/Policy.js");
const { Project } = require("../Models/Project.js");
const offersList = process.env.OFFERS
const requestsList = process.env.REQUESTS

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

    /* 
        rankedVotes: an array of vote objects each containing a policyURL and a voteRank
        voter: string
    */
    router.post("/addPreferenceVotes", async (req, res) => {
        const { rankedVotes, voter } = req.body;

        const promises = rankedVotes.map(async vote => {
            const voteDetails = {
                voter: voter,
                policyURL: vote.policyURL,
                voteRank: vote.voteRank
            };

            try {
                await voteService.addVote(voteDetails, appSession);
            } catch (error) {
                console.error(`Error in adding vote for policy ${vote.policyURL}:`, error);
                return { policyURL: vote.policyURL, error: error.message };
            }

            return { policyURL: vote.policyURL, status: "Vote added successfully." };
        });

        const results = await Promise.all(promises);
        const errors = results.filter(result => result.error);

        if (errors.length > 0) {
            res.status(500).send({ message: "Error(s) in adding multiple votes.", errors });
        } else {
            res.send({ message: "All votes added successfully.", results });
        }
    });


    /* 
        voter: string
        policyURL: string
    */
    router.post("/upvote", async (req, res) => {
        const { voter, policyURL } = req.body;

        const vote = {
            voter: voter,
            policyURL: policyURL,
            voteRank: 1
        };

        try {
            await voteService.addVote(vote, appSession);
            res.send({ message: "Vote added successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in adding vote.", error: error.message });
        }
    });

    /* 
        voter: string
        policyURL: string
    */
    router.post("/downvote", async (req, res) => {
        const { voter, policyURL } = req.body;

        const vote = {
            voter: voter,
            policyURL: policyURL,
            voteRank: 2
        };

        try {
            await voteService.addVote(vote, appSession);
            res.send({ message: "Vote added successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in adding vote.", error: error.message });
        }
    });

    /* 
        policyURL: string
    */
    router.get("/getRequestResult", async (req, res) => {
        const policyURL = req.body.policyURL;

        if (!policyURL) {
            res.status(400).send({ message: "Policy URL is required." });
            return;
        }
        else {
            const type = getPolicyDataset(policyURL);
            let policy;
            if (type === requestsList) {
                policy = new Request();
                await policy.fetchPolicy(policyURL, appSession);
            }
            else if (type === offersList) {
                policy = new Offer();
                await policy.fetchPolicy(policyURL, appSession);
            }
            const policyJSON = policy.toJson();

            try {
                const upvotes = await voteService.countVotesByRankPolicy(
                    { policyURL: policyURL, rank: 1 },
                    appSession);
                const downvotes = await voteService.countVotesByRankPolicy(
                    { policyURL: policyURL, rank: 2 },
                    appSession);
                const membersNumber = await userService.getMemberCount(appSession);
                const abstention = membersNumber - (upvotes + downvotes);
                const threshold = policyJSON.threshold;
                let result = false;
                if (upvotes > (membersNumber * threshold)) {
                    result = true;
                }
                res.send({ result, upvotes, downvotes, abstention, membersNumber, threshold });
            }


            catch (error) {
                console.error(error);
                res.status(500).send({ message: "Error in retrieving result.", error: error.message });
            }
        }


    });

    /* 
        projectURL: string
    */
    router.get("/getOfferResult", async (req, res) => {
        const projectURL = req.body.projectURL;
        try {
            const projectPolicies = await policyService.getProjectPolicies(projectURL, appSession);
            const projectOffers = projectPolicies.offers;
            const membersNumber = await userService.getMemberCount(appSession);
            const project = new Project();
            await project.fetchProject(projectURL, appSession);
            const threshold = project.toJson().threshold;
            const thresholdType = project.toJson().thresholdType;
            let results = [];
            let winner = `${offersList}#rejection`;
            for (const offer of projectOffers) {
                const firstPreference = await voteService.countVotesByRankPolicy(
                    { policyURL: offer, rank: 1 },
                    appSession);
                results.push({ policyUrl: offer, count: firstPreference });
            }
            const rejectVote = await voteService.countVotesByRankPolicy({ offerId: 0, rank: 1 }, appSession);
            results.push({ policyUrl: `${offersList}#rejection`, count: rejectVote });
            const sortedResults = results.sort((a, b) => b.count - a.count);
            const totalCount = sortedResults.reduce((total, policy) => total + policy.count, 0);
            let cutoff;
            if (thresholdType === "totalVote") {
                cutoff = threshold * totalCount;
            } else {
                cutoff = membersNumber * threshold
            }
            if (sortedResults[0].count > cutoff) {
                winner = sorted[0].policyUrl;
            }
            res.send({ sortedResults, winner, membersNumber, threshold });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in retrieving result.", error: error.message });
        }
    });

    return router;
};