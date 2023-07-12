const router = require("express").Router();
const { appSession, userSession } = require('../Index.js');
const service = require("../CRUDService.js");

<<<<<<< HEAD
module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(JSON.stringify(appSession.info));
        res.send({ message: `Hello App Session WebID: ${appSession.info.webId}` });
    });

    router.post("/registerMember", async function (req, res) {
        console.log("registerMember");
        console.log(req.body);
        const { webID, email, name, dataSource } = req.body;
        if (!webID || !email || !name || !dataSource) {
            res.status(400).send({ message: "All fields are required." });
            return;
        }
        else {
            await userService.checkUserByType({ webID: webID, type: "MEMBER" }, appSession);
            try {
                await userService.addMember(req, appSession);
                // await userService.addNewData(dataSource, appSession, sessionId); // FIX THIS AND HOW THE SESSION ID IS PASSED
                res.send({ message: "Member registered successfully." });
            }
            catch (error) {
                console.error(error);
                res.status(500).send({ message: "Error in registering member.", error: error.message });
            }
        }
    });

    router.post("/registerThirdParty", async function (req, res) {
        const { webID, email, name, org, description } = req.body;
        if (!webID || !email || !name || !org || !description) {
            res.status(400).send({ message: "All fields are required." });
            return;
        }
        else {
            if (await userService.checkUserByType({ webID: webID, type: "THIRDPARTY" }, appSession)) {
                res.status(400).send({ message: "User is already registered as a member." });
            }
            else {
                try {
                    await userService.addThirdParty(req, appSession);
                    res.send({ message: "Member registered successfully." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in registering third party.", error: error.message });
                }
            }
        }
    });

    router.get("/viewMember", async (req, res, next) => {
        const { webID } = req.body;
        if (!webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            if (await userService.checkUserByType({ webID: webID, type: "MEMBER" }, appSession)) {
                try {
                    const fetchedMember = new Member();
                    await fetchedMember.fetchUser(webID, appSession);
                    res.send({ data: fetchedMember.toJson(), message: "User found." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in finding member.", error: error.message });
                }
            }
            else {
                res.status(400).send({ message: "Member not found." });
            }
        }
    });

    router.get("/viewThirdParty", async (req, res, next) => {
        const { webID } = req.body;
        if (!webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            if (await userService.checkUserByType({ webID: webID, type: "THIRDPARTY" }, appSession)) {
                try {
                    const fetchedThirdParty = new ThirdParty();
                    await fetchedThirdParty.fetchUser(webID, appSession);
                    res.send({ data: fetchedThirdParty.toJson(), message: "Third party found." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in finding third party.", error: error.message });
                }
            }
            else {
                res.status(400).send({ message: "Third party not found." });
            }
        }
    });

    router.get("/viewAdmin", async (req, res, next) => {
        const { webID } = req.body;
        if (!webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            if (await userService.checkUserByType({ webID: webID, type: "ADMIN" }, appSession)) {
                try {
                    const fetchedAdmin = new Admin();
                    await fetchedAdmin.fetchUser(webID, appSession);
                    res.send({ data: fetchedAdmin.toJson(), message: "Admin found." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in finding admin.", error: error.message });
                }
            }
            else {
                res.status(400).send({ message: "Admin not found." });
            }
        }
    });

    router.put("/updateUser", async (req, res, next) => {
        const userType = await userService.checkUser({ webID: req.webID }, appSession);
        req.datasetURL = userType;
        if (userType) {
            try {
                const userData = await userService.updateUser(req, appSession);
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
        const userType = await userService.checkUser({ webID: req.webID }, appSession);
        if (userType) {
            try {
                const userData = userService.getUser({ webID: req.webID, userType }, appSession)
                await userService.removeData(userData.dataSource, appSession.sessionId);
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
=======
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
>>>>>>> parent of f7ab3e8 (Adding another route page)
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