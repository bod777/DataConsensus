const router = require("express").Router();
const voteService = require("../CRUDService/VoteService.js");
const policyService = require("../CRUDService/PolicyService.js");
const userService = require("../CRUDService/UserService.js");

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

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

    router.get("/getRequestResult", async (req, res) => {
        const policyURL = req.body.policyURL;

        if (!policyURL) {
            res.status(400).send({ message: "Policy URL is required." });
            return;
        }

        try {
            const upvotes = await voteService.countVotesByRankPolicy(
                { policyURL: policyURL, rank: 1 },
                appSession);
            const downvotes = await voteService.countVotesByRankPolicy(
                { policyURL: policyURL, rank: 2 },
                appSession);
            const membersNumber = await userService.getMemberCount(appSession);
            const threshold = await policyService.getProjectThreshold(policyURL, appSession);
            let result = false;
            if (upvotes > (membersNumber * threshold)) {
                result = true;
            }
            res.send({ result, upvotes, downvotes, membersNumber, threshold });
        }


        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in retrieving result.", error: error.message });
        }
    });

    router.get("/getRequestResult", async (req, res) => {
        const policyURL = req.body.policyURL;
        if (!policyURL) {
            res.status(400).send({ message: "Policy URL is required." });
            return;
        }

        try {

            const upvotes = await voteService.countVotesByRankPolicy(
                { policyURL: policyURL, rank: 1 },
                appSession);
            const downvotes = await voteService.countVotesByRankPolicy(
                { policyURL: policyURL, rank: 2 },
                appSession);
            const membersNumber = await userService.getMemberCount(appSession);
            const threshold = await policyService.getProjectThreshold(policyURL, appSession);
            let result = false;
            if (upvotes > (membersNumber * threshold)) {
                result = true;
            }
            res.send({ result, upvotes, downvotes, membersNumber, threshold });
        }


        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in retrieving result.", error: error.message });
        }
    });

    router.get("/getOfferResult", async (req, res) => {
        const projectURL = req.body.projectId;
        try {
            const offerList = policyService.getProjectOffers(projectURL, appSession);
            const membersNumber = await userService.getMemberCount(appSession);
            const threshold = await policyService.getProjectThreshold(offer.policyURL, appSession);
            const cutoff = membersNumber * threshold
            let results = [];
            let winner = `${process.env.OFFERS}#rejection`;
            for (const offer of offerList) {
                const firstPreference = await voteService.countVotesByRankPolicy(
                    { policyUrl: offer.url, rank: 1 },
                    appSession);
                results.push({ policyUrl: offer.url, count: firstPreference });
            }
            const rejectVote = await voteService.countVotesByRankPolicy({ offerId: 0, rank: 1 }, appSession);
            results.push({ policyUrl: `${process.env.OFFERS}#rejection`, count: rejectVote });
            const sortedResults = results.sort((a, b) => b.count - a.count);
            if (sorted[0].count > cutoff) {
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