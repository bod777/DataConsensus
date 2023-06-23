const express = require('express');
const router = express.Router();
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");
const service = require("./CRUDService.js");

app.post("/registerMember", async function (req, res) {

});

app.post("/registerThirdParty", async function (req, res) {

});

app.post("/login", async (req, res, next) => {

});

app.get("/viewUser", async (req, res, next) => {

});

app.get("/logout", async (req, res, next) => {
    const session = await getSessionFromStorage(req.session.sessionId);
    session.logout();
    res.send(`<p>Logged out.</p>`);
});

app.get("/removeData", async (req, res, next) => {

});

module.exports = router;