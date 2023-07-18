const router = require("express").Router();
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");
const userService = require("../CRUDService/UserService.js");
const { Member, ThirdParty, Admin } = require("../Models/User.js");

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        console.log(JSON.stringify(userSession.info));
        res.send({ message: `userSession Session WebID: ${userSession.info.webId}` });
    });

    router.post("/registerMember", async function (req, res) {
        // const userSession = await getSessionFromStorage(req.session.sessionId);
        // console.log(req.session);
        const { webID, email, name, dataSource } = req.body;
        if (!webID || !email || !name || !dataSource) {
            res.status(400).send({ message: "All fields are required." });
            return;
        }
        else {
            await userService.checkUserByType({ webID: webID, type: "MEMBER" }, appSession);
            try {
                await userService.addMember(req, appSession);
                // await userService.addNewData(dataSource, appSession, userSession); // FIX THIS AND HOW THE SESSION ID IS PASSED
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

    router.put("/updateMember", async (req, res, next) => {
        if (!req.body.webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            if (await userService.checkUserByType({ webID: req.body.webID, type: "MEMBER" }, appSession)) {
                req.body.datasetURL = "MEMBER";
                try {
                    await userService.updateUser(req, appSession);
                    const updatedUser = new Member();
                    await updatedUser.fetchUser(req.body.webID, appSession);
                    res.send({ data: updatedUser, message: "User updated successfully." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in updating user.", error: error.message });
                }
            }
            else {
                res.status(400).send({ message: "Member not found." });
            }
        }
    });

    router.put("/updateThirdParty", async (req, res, next) => {
        if (!req.body.webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            if (await userService.checkUserByType({ webID: req.body.webID, type: "THIRDPARTY" }, appSession)) {
                req.body.datasetURL = "THIRDPARTY";
                try {
                    await userService.updateUser(req, appSession);
                    const updatedUser = new ThirdParty();
                    await updatedUser.fetchUser(req.body.webID, appSession);
                    res.send({ data: updatedUser, message: "User updated successfully." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in updating user.", error: error.message });
                }
            }
            else {
                res.status(400).send({ message: "User not found." });
            }
        }
    });

    router.put("/updateAdmin", async (req, res, next) => {
        if (!req.body.webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            if (await userService.checkUserByType({ webID: req.body.webID, type: "ADMIN" }, appSession)) {
                req.body.datasetURL = "ADMIN";
                try {
                    await userService.updateUser(req, appSession);
                    const updatedUser = new Admin();
                    await updatedUser.fetchUser(req.body.webID, appSession);
                    res.send({ data: updatedUser, message: "User updated successfully." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in updating user.", error: error.message });
                }
            }
            else {
                res.status(400).send({ message: "User not found." });
            }
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
        try {
            const memberCount = await userService.getMemberCount(appSession);
            res.send({ data: memberCount, message: "Member count found." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: `${appSession.info.sessionId} Error in finding member count.`, error: error.message });
        }
    });

    return router;
};