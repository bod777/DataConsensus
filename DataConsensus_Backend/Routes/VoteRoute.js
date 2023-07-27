const router = require("express").Router();
const { Comment } = require("../Models/Comment.js");
const voteService = require("../CRUDService/VoteService.js");
const policyService = require("../CRUDService/PolicyService.js");
const userService = require("../CRUDService/UserService.js");
const { getPolicyDataset } = require("../HelperFunctions.js");
const { Request, Offer } = require("../Models/Policy.js");
const { Project } = require("../Models/Project.js");
const { Vote, BinaryVote, PreferenceVote } = require("../Models/Vote.js");
const offersList = process.env.OFFERS
const requestsList = process.env.REQUESTS
const projectsList = process.env.PROJECTS

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

    /* 
        rankedVotes: an array of vote objects each containing a policyURL and a voteRank
        voter: string
    */
    router.post("/add-preference", async (req, res) => {
        try {
            const { rankedVotes, voter, projectID } = req.body;
            for (const vote of rankedVotes) {
                const voteDetails = {
                    voter: voter,
                    policyURL: vote.policyURL,
                    voteRank: vote.voteRank,
                    isPreference: true,
                    projectURL: projectID
                };
                await voteService.addVote(voteDetails, appSession);
            }
            res.send({ message: "All votes added successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error(s) in adding multiple votes.", errors: error.errors });
        }
    });


    /* 
        voter: string
        policyURL: string
    */
    router.post("/upvote", async (req, res) => {
        const { voter, policyURL, projectURL } = req.body;

        const vote = {
            voter: voter,
            policyURL: policyURL,
            voteRank: 1,
            isPreference: false,
            projectURL: projectURL
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
        const { voter, policyURL, projectURL } = req.body;

        const vote = {
            voter: voter,
            policyURL: policyURL,
            voteRank: 2,
            isPreference: false,
            projectURL: projectURL
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
    router.get("/request-vote", async (req, res) => {
        const { voter, policyID } = req.query;
        const policyURL = `${requestsList}#${policyID}`;
        try {
            const fetchedVote = new BinaryVote();
            await fetchedVote.fetchVote({ voter, policyURL }, appSession);
            const vote = await fetchedVote.toJson();
            // console.log("vote data:", vote);
            res.send({ data: vote });
        }
        catch (error) {
            if (error.message === "No votes found") {
                console.log(`No vote found`);
                res.send({ data: null });
            }
            else {
                console.error(error);
                res.status(500).send({ message: "Error in retrieving votes.", error: error.message });
            }
        }
    });

    router.get("/offer-vote", async (req, res) => {
        // console.log("get offer vote");
        // console.log(req.query);
        const { voter, projectID } = req.query;
        const projectURL = `${projectsList}#${projectID}`;
        // console.log("project URL ", projectURL);
        const projectPolicies = await policyService.getProjectPolicies(projectURL, appSession);
        const projectOffers = projectPolicies.offers;
        projectOffers.push(`${offersList}#rejection`)
        // console.log("list of offer URL ", projectOffers);
        const rankedOffers = []
        // console.log("project offers ", projectOffers);
        for (const offer of projectOffers) {
            // console.log("individual offer ", offer);
            try {
                // console.log("trying");
                const fetchedVote = new PreferenceVote();
                // console.log("fetching");
                await fetchedVote.fetchVote({ voter, policyURL: offer, projectURL }, appSession);
                // console.log("fetched");
                const vote = await fetchedVote.toJson();
                // console.log("vote data:", vote);
                rankedOffers.push({ URL: vote.policy, rank: vote.rank });
                // console.log("pushed");
            }
            catch (error) {
                if (error.message === "No votes found") {
                    console.log(`No votes found for offer ${offer}`);
                    rankedOffers.push({ URL: offer, rank: projectOffers.length + 1 });
                } else {
                    console.error(error);
                    res.status(500).send({ message: "Error in retrieving votes.", error: error.message });
                    return;
                }
            }
        }
        // console.log("rankedOffers: ", rankedOffers);
        rankedOffers.sort((a, b) => a.rank - b.rank);
        const sortedOffersWithoutRank = rankedOffers.map(({ URL }) => ({
            URL, id: URL.substring(URL.lastIndexOf("#") + 1) === "rejection"
                ? "reject all offers"
                : URL.substring(URL.lastIndexOf("#") + 1)
        }));
        // console.log("sortedOffersWithoutRank: ", sortedOffersWithoutRank);
        res.send({ data: sortedOffersWithoutRank });
    });

    /* 
        policyURL: string
    */
    router.get("/request-result", async (req, res) => {
        const policyID = req.query.policyID;
        if (!policyID) {
            res.status(400).send({ message: "policyID is required." });
        }
        else {
            try {
                const policyURL = `${requestsList}#${policyID}`;
                policy = new Request();
                await policy.fetchPolicy(policyURL, appSession);
                const policyJSON = policy.toJson();
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
    router.get("/offer-result", async (req, res) => {
        const projectURL = `${projectsList}#${req.query.projectID}`;
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
            const rejectVote = await voteService.countVotesByRankPolicy({ policyURL: `${offersList}#rejection`, rank: 1 }, appSession);
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