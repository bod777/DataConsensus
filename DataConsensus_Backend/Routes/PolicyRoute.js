const express = require('express');
const router = express.Router();
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");
const service = require("./CRUDService.js");

app.post("/submitRequest", async function (req, res) {

});

app.post("/submitCounterOffer", async (req, res) => {

});

app.get("/allRequests", async function (req, res) {

});

app.get("/allOffers", async (req, res) => {

});

app.get("/allAgreements", async (req, res) => {

});

app.get("/getCounterOffers", async function (req, res) {

});

app.get("/getPolicy", async function (req, res) {

});

module.exports = router;