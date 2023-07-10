const router = require("express").Router();
const { appSession } = require('../Index.js');
const service = require("../CRUDService.js");

/* VOTING ENDPOINTS */

router.post("/addPreferenceVotes", async (req, res) => {
    const { rankedVotes, voter } = req.body; // votes should be an array of objects { policyURL: "url", voteRank: "rank" }

    const promises = rankedVotes.map(async vote => {
        const voteDetails = {
            voter: voter,
            policyURL: vote.policyURL,
            voteRank: vote.voteRank
        };

        try {
            await service.addVote(voteDetails, appSession.sessionId);
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
        await service.addVote(vote, appSession.sessionId);
        res.send({ message: "Vote added successfully." });
    }
    catch (error) {
        console.error(error); // log the error for debugging
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
        await service.addVote(vote, appSession.sessionId);
        res.send({ message: "Vote added successfully." });
    }
    catch (error) {
        console.error(error); // log the error for debugging
        res.status(500).send({ message: "Error in adding vote.", error: error.message });
    }
});

router.get("/getRequestResult", async (req, res) => {
    const policyURL = req.body.policyURL; // get the policy URL from the query parameters

    if (!policyURL) {
        res.status(400).send({ message: "Policy URL is required." });
        return;
    }

    try {
        const upvotes = await service.countVotesByRankPolicy(
            { policyURL: policyURL, rank: 1 },
            appSession.sessionId);
        const downvotes = await service.countVotesByRankPolicy(
            { policyURL: policyURL, rank: 2 },
            appSession.sessionId);
        const membersNumber = await service.getNumberOfMembers(appSession.sessionId);
        const threshold = await service.getThreshold(policyURL, appSession.sessionId);
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
    const policyURL = req.body.policyURL; // get the policy URL from the query parameters

    if (!policyURL) {
        res.status(400).send({ message: "Policy URL is required." });
        return;
    }

    try {

        const upvotes = await service.countVotesByRankPolicy(
            { policyURL: policyURL, rank: 1 },
            appSession.sessionId);
        const downvotes = await service.countVotesByRankPolicy(
            { policyURL: policyURL, rank: 2 },
            appSession.sessionId);
        const membersNumber = await service.getNumberOfMembers(appSession.sessionId);
        const threshold = await service.getThreshold(policyURL, appSession.sessionId);
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
        const offerList = service.getOffersByProject(projectURL, appSession.sessionId);
        const membersNumber = await service.getNumberOfMembers(appSession.sessionId);
        const threshold = await service.getThreshold(offer.policyURL, appSession.sessionId);
        const cutoff = membersNumber * threshold
        let results = [];
        let winner = `${process.env.OFFERS}#rejection`;
        for (const offer of offerList) {
            const firstPreference = await service.countVotesByRankPolicy(
                { policyUrl: offer.url, rank: 1 },
                appSession.sessionId);
            results.push({ policyUrl: offer.url, count: firstPreference });
        }
        const rejectVote = await service.countVotesByRankPolicy({ offerId: 0, rank: 1 }, appSession.sessionId);
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

/* COMMENT ENDPOINTS */

router.post("/addComment", async (req, res) => {
    const {
        URL, user, text
    } = req.body;

    const comment = {
        policyURL: URL,
        creator: user,
        comment: text
    };
    try {
        await service.submitPolicy(comment, appSession.sessionId);
        res.send({ message: "Offer submitted successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in submitting offer.", error: error.message });
    }
});

router.get("/getCommentsByPolicy", async (req, res) => {
    const policyURL = req.body.policyURL; // get the policy URL from the query parameters

    if (!policyURL) {
        res.status(400).send({ message: "Policy URL is required." });
        return;
    }

    try {
        const comments = await service.getCommentsByPolicy(policyURL, appSession.sessionId);
        res.send({ comments });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in retrieving comments.", error: error.message });
    }
});

router.post("/moderateComment", async (req, res) => {
    const { commentID, moderator } = req.body;

    if (!commentID || !moderator) {
        res.status(400).send({ message: "Both commentID and moderator are required." });
        return;
    }

    try {
        await service.moderateComment({ commentID, moderator }, appSession.sessionId);
        res.send({ message: "Comment moderated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in moderating the comment.", error: error.message });
    }
});

router.delete("/removeComment", async (req, res) => {
    const { commentID } = req.body;

    if (!commentID) {
        res.status(400).send({ message: "commentID is required." });
        return;
    }

    try {
        await service.removeComment({ commentID }, appSession.sessionId);
        res.send({ message: "Comment removed successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in removing the comment.", error: error.message });
    }
});


module.exports = router;