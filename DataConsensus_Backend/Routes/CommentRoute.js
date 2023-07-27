require("dotenv").config();
const router = require("express").Router();
const { Comment } = require("../Models/Comment.js");
const commentService = require("../CRUDService/CommentService.js");
const commentsList = process.env.COMMENTS;

module.exports = function (appSession) {
    // Use appSession in your routes
    router.get("/", (req, res) => {
        console.log(appSession.info.webId);
        res.send({ message: `App Session WebID: ${appSession.info.webId}` });
    });

    router.post("/add-comment", async (req, res) => {
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

    router.get("/comments", async (req, res) => {
        const policyID = req.query.policyID;
        const policyType = req.query.policyType;
        const policyURL = `${policyType}#${policyID}`;
        console.log(policyURL);
        if (!policyID || !policyType) {
            res.status(400).send({ message: "Policy ID or/and Policy Type are required." });
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

    router.put("/moderate-comment", async (req, res) => {
        console.log(req.body);
        const { commentID, moderator } = req.body;

        if (!commentID || !moderator) {
            res.status(400).send({ message: "Both commentURL and moderator are required." });
            return;
        }
        const commentURL = `${commentsList}#${commentID}`;
        console.log("commentURL: ", commentURL);
        try {
            await commentService.moderateComment({ commentURL, moderator }, appSession);
            res.send({ message: "Comment moderated successfully." });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in moderating the comment.", error: error.message });
        }
    });

    router.delete("/remove-comment", async (req, res) => {
        const { commentID } = req.query;
        if (!commentID) {
            res.status(400).send({ message: "commentID is required." });
            return;
        }
        const commentURL = `${commentsList}#${commentID}`;
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