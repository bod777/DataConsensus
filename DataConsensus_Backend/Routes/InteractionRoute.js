const express = require('express');
const router = express.Router();
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");
const service = require("./CRUDService.js");

app.post("/rankedVote", async function (req, res) {

});

app.post("/basicVote", async (req, res) => {

});

app.post("/addComment", async (req, res) => {

});

app.post("/approveProposal", async function (req, res) {

});

app.get("/removeComment", async (req, res) => {

});

app.get("/removeDraftOffer", async (req, res) => {

});

app.get("/getVotes", async (req, res) => {

});

app.get("/getComments", async (req, res) => {

});

module.exports = router;