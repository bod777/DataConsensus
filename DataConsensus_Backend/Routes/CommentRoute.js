const router = require("express").Router();
const { Comment } = require("../Models/Comment.js");
const interactionService = require("../CRUDService/InteractionService.js");

module.exports = function (appSession) {
    // Use appSession in your routes
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

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
            await interactionService.addComment(comment, appSession);
            res.send({ message: "Offer submitted successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in submitting offer.", error: error.message });
        }
    });

    router.get("/getComments", async (req, res) => {
        const policyURL = req.body.policyURL;
        if (!policyURL) {
            res.status(400).send({ message: "Policy URL is required." });
            return;
        }
        else {
            try {
                const commentURLs = await interactionService.getCommentsByPolicy(policyURL, appSession);
                let comments = [];
                for (const commentURL of commentURLs) {
                    const fetchedComment = new Comment();
                    const request = await fetchedComment.fetchComment(commentURL, appSession);
                    comments.push(fetchedComment.toJson());
                }
                res.send({ data: comments });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Error in getting comments", error: error.message });
            }
        }
    });

    router.post("/moderateComment", async (req, res) => {
        const { commentID, moderator } = req.body;

        if (!commentID || !moderator) {
            res.status(400).send({ message: "Both commentID and moderator are required." });
            return;
        }

        try {
            await interactionService.moderateComment({ commentID, moderator }, appSession);
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
            await interactionService.removeComment({ commentID }, appSession);
            res.send({ message: "Comment removed successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing the comment.", error: error.message });
        }
    });

    return router;
};