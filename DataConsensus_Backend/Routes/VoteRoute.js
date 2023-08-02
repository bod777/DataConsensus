const router = require("express").Router();
const voteService = require("../CRUDService/VoteService.js");
const policyService = require("../CRUDService/PolicyService.js");
const userService = require("../CRUDService/UserService.js");
const projectService = require("../CRUDService/ProjectService.js");
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
            const { rankedVotes, voter, projectURL } = req.body;
            for (const vote of rankedVotes) {
                const voteDetails = {
                    voter: voter,
                    policyURL: vote.policyURL,
                    voteRank: Number(vote.voteRank),
                    isPreference: true,
                    projectURL: projectURL
                };
                // console.log(voteDetails);
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
        const { voter, policyURL, projectID } = req.body;
        // console.log(req.body);
        const vote = {
            voter: voter,
            policyURL: policyURL,
            voteRank: 1,
            isPreference: false,
            projectURL: `${projectsList}#${projectID}`
        };
        // console.log(vote);
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
        const { voter, policyURL, projectID } = req.body;
        // console.log(req.body);
        const vote = {
            voter: voter,
            policyURL: policyURL,
            voteRank: 2,
            isPreference: false,
            projectURL: `${projectsList}#${projectID}`
        };
        // console.log(vote);
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
    router.get("/get-vote", async (req, res) => {
        const { voter, policyID } = req.query;
        const policyURL = `${requestsList}#${policyID}`;
        try {
            const fetchedVote = await voteService.getBinaryVote({ voter, policyURL }, appSession);
            // console.log("vote data:", vote);
            res.send({ data: fetchedVote });
        }
        catch (error) {
            if (error.message === "No votes found") {
                // console.log(`No vote found`);
                res.send({ data: null });
            }
            else {
                console.error(error);
                res.status(500).send({ message: "Error in retrieving votes.", error: error.message });
            }
        }
    });

    router.get("/get-preference", async (req, res) => {
        // console.log("get offer vote");
        // console.log(req.query);
        const { voter, projectID } = req.query;
        const projectURL = `${projectsList}#${projectID}`;
        // console.log("project URL ", projectURL);
        const project = await projectService.getProject(projectURL, appSession);
        const projectOffers = project.projectPolicies.offers.map(offer => offer.URL);
        projectOffers.push(`${offersList}#rejection`)
        // console.log("list of offer URL ", projectOffers);
        const rankedOffers = []
        // console.log("project offers ", projectOffers);
        // console.log("project offers ", projectOffers);
        for (const offer of projectOffers) {
            try {
                // console.log("getting vote for ", offer);
                const vote = await voteService.getPreferenceVote({ voter, policyURL: offer, projectURL }, appSession);
                // console.log(vote);
                rankedOffers.push({ URL: vote.policy, rank: Number(vote.rank) });
                // console.log("pushed");
            }
            catch (error) {
                if (error.message === "No votes found") {
                    // console.log(`No votes found for offer ${offer}`);
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
        // console.log("sortedOffers: ", rankedOffers)
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
        const date = req.query.date;
        // console.log(policyID);
        if (!policyID) {
            res.status(400).send({ message: "policyID is required." });
        }
        else {
            try {
                const policyURL = `${requestsList}#${policyID}`;
                const policyJSON = await policyService.fetchProposal(policyURL, appSession);
                const upvotes = await voteService.countVotesByRankPolicy(
                    { policyURL: policyURL, rank: 1 },
                    appSession);
                const downvotes = await voteService.countVotesByRankPolicy(
                    { policyURL: policyURL, rank: 2 },
                    appSession);
                const membersNumber = await userService.getMemberCount(date, appSession);
                const abstention = membersNumber - (upvotes + downvotes);
                const threshold = policyJSON.threshold;
                let result = false;
                if (upvotes > Math.ceil(membersNumber * threshold)) {
                    result = true;
                }
                if (result === true) {
                    const projectToUpdate = { policyURL, actor: "memberApproved", newStatus: "Approved" };
                    updatedProject = await policyService.updatePolicyStatus(projectToUpdate, appSession);
                }
                else {
                    const projectToUpdate = { policyURL, actor: "memberApproved", newStatus: "Rejected" };
                    updatedProject = await policyService.updatePolicyStatus(projectToUpdate, appSession);
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
        const date = req.query.date;
        try {
            const project = await projectService.getProject(projectURL, appSession);
            const projectOffers = project.projectPolicies.offers.map(offer => offer.URL);
            const membersNumber = await userService.getMemberCount(date, appSession);
            const threshold = project.threshold;
            let results = [];
            let winner = `rejection`;
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
            const cutoff = Math.ceil(membersNumber * threshold);
            for (let i = 0; i < sortedResults.length; i++) {
                const policyToUpdate = { policyURL: sortedResults[i].policyUrl, actor: "memberApproved" };
                if (i === 0) {
                    policyToUpdate.newStatus = "Approved";
                } else {
                    policyToUpdate.newStatus = "Rejected";
                }
                // console.log(policyToUpdate);
                await policyService.updatePolicyStatus(policyToUpdate, appSession);
            }
            if (sortedResults[0].count > cutoff) {
                winner = sortedResults[0].policyUrl;
            }
            res.send({ sortedResults, winner, totalCount, cutoff, membersNumber, threshold });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in retrieving result.", error: error.message });
        }
    });

    return router;
};