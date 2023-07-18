const router = require("express").Router();
const { Comment } = require("../Models/Comment.js");
const commentService = require("../CRUDService/CommentService.js");

module.exports = function (appSession) {
    // Use appSession in your routes
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

    router.post("/addComment", async (req, res) => {
        const {
            policyURL, user, text
        } = req.body;

        const comment = {
            policyURL: policyURL,
            creator: user,
            comment: text
        };
        try {
            const commentURL = await commentService.addComment(comment, appSession);
            const newComment = new Comment();
            await newComment.fetchComment(commentURL, appSession);
            console.log(newComment.toJson());
            res.send({ data: newComment.toJson(), message: "Offer submitted successfully." });
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
                const commentURLs = await commentService.getCommentsByPolicy(policyURL, appSession);
                let comments = [];
                for (const comment of commentURLs) {
                    const fetchedComment = new Comment();
                    await fetchedComment.fetchComment(comment, appSession);
                    comments.push(fetchedComment.toJson());
                }
                res.send({ data: comments });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Error in getting comments", error: error.message });
            }
        }
    });

    router.put("/moderateComment", async (req, res) => {
        const { commentURL, moderator } = req.body;

        if (!commentURL || !moderator) {
            res.status(400).send({ message: "Both commentURL and moderator are required." });
            return;
        }

        try {
            await commentService.moderateComment({ commentURL, moderator }, appSession);
            res.send({ message: "Comment moderated successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in moderating the comment.", error: error.message });
        }
    });

    router.delete("/removeComment", async (req, res) => {
        const { commentURL } = req.body;
        if (!commentURL) {
            res.status(400).send({ message: "commentURL is required." });
            return;
        }

        try {
            await commentService.removeComment(commentURL, appSession);
            res.send({ message: "Comment removed successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing the comment.", error: error.message });
        }
    });

    return router;
};