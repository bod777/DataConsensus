const router = require("express").Router();
const { appSession, userSession } = require('../Index.js');
const service = require("../CRUDService.js");

router.post("/registerMember", async function (req, res) {
    const { webID, name, dataSource } = req.body;
    if (!dataSource) {
        res.status(400).send({ message: "Data Source is required." });
        return;
    }
    await service.checkUserByType({ webID: webID, type: "MEMBER" }, appSession.sessionId);
    try {
        await service.addMember(req, appSession.sessionId);
        await service.addNewData(dataSource, sessionID);
        res.send({ message: "Member registered successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in registering member.", error: error.message });
    }
});

router.post("/registerThirdParty", async function (req, res) {
    const { webID, email, name, org, description } = req.body;
    if (!webID || !email || !name || !org || !description) {
        res.status(400).send({ message: "All fields are required." });
        return;
    }
    if (await service.checkUserByType({ webID: webID, type: "THIRDPARTY" }, appSession.sessionId)) {
        res.status(400).send({ message: "User is already registered as a member." });
    }
    else {
        try {
            await service.addThirdParty(req, appSession.sessionId);
            res.send({ message: "Member registered successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in registering third party.", error: error.message });
        }
    }
});


// FIX THIS TO INCLUDE THE USER MODEL
router.get("/viewUser", async (req, res, next) => {
    const { webID } = req.body;
    if (!webID) {
        res.status(400).send({ message: "WebID are required." });
        return;
    }
    const userType = await service.checkUser({ webID }, appSession.sessionId);
    if (userType) {
        try {
            const userData = await service.getUser({ webID, userType }, appSession.sessionId);
            res.send({ data: userData, message: "User found." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in finding user.", error: error.message });
        }
    }
    else {
        res.status(400).send({ message: "User not found." });
    }
});

router.put("/updateUser", async (req, res, next) => {
    const userType = await service.checkUser({ webID: req.webID }, appSession.sessionId);
    req.datasetURL = userType;
    if (userType) {
        try {
            const userData = await service.updateUser(req, appSession.sessionId);
            res.send({ data: userData, message: "User updated successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in updating user.", error: error.message });
        }
    }
    else {
        res.status(400).send({ message: "User not found." });
    }
});

router.delete("/removeData", async (req, res, next) => {
    const userType = await service.checkUser({ webID: req.webID }, appSession.sessionId);
    if (userType) {
        try {
            const userData = service.getUser({ webID: req.webID, userType }, appSession.sessionId)
            await service.removeData(userData.dataSource, appSession.sessionId);
            res.send({ message: "Data removed successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing data.", error: error.message });
        }
    }
    else {
        res.status(400).send({ message: "User not found." });
    }
});

router.get("/getMemberCount", async (req, res, next) => {
    try {
        const memberCount = await service.getMemberCount(appSession.sessionId);
        res.send({ data: memberCount, message: "Member count found." });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in finding member count.", error: error.message });
    }
});

module.exports = router;