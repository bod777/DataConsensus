require("dotenv").config();
const router = require("express").Router();
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");
const userService = require("../CRUDService/UserService.js");
const { Member, ThirdParty, Admin } = require("../Models/User.js");

const resourceURL = process.env.RESOURCE_URL;

module.exports = function (appSession) {
    router.get("/", (req, res) => {
        res.send({ message: `userSession Session WebID: ${userSession.info.webId}` });
    });

    router.get("/check-user", async (req, res, next) => {
        const webID = req.query.webID;
        if (!webID) {
            res.status(400).send({ message: "WebID are required." });
        }
        else {
            const userTypes = ["MEMBER", "THIRDPARTY", "ADMIN"];
            let isUser = false;
            let type;
            for (const userType of userTypes) {
                isUser = await userService.checkUserByType({ type: userType, webID }, appSession);
                if (isUser) {
                    type = userType;
                    break;
                }
            }
            if (isUser) {
                res.send({ data: type, message: "User found." });
            }
            else {
                res.send({ message: "User not found." });
            }
        }
    });

    router.post("/register-member", async function (req, res) {
        const { webID, email, name, dataSource, sessionID } = req.body;
        const userSession = await getSessionFromStorage(sessionID);
        if (!webID || !email || !name || !dataSource) {
            res.status(400).send({ message: "All fields are required." });
            return;
        }
        else {
            const existsAlready = await userService.checkUserByType({ webID: webID, type: "MEMBER" }, appSession);
            console.log("does it exist?", existsAlready);
            // const existsAlready = false;
            if (existsAlready) {
                res.status(400).send({ message: "User is already registered as a member." });
            }
            else {
                try {
                    await userService.addMember(req, appSession);
                    await userService.addNewData(dataSource, appSession, userSession); // FIX THIS AND HOW THE SESSION ID IS PASSED
                    res.send({ message: "Member registered successfully." });
                }
                catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error in registering member.", error: error.message });
                }
            }
        }
    });

    router.post("/register-thirdparty", async function (req, res) {
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

    router.get("/member", async (req, res, next) => {
        const { webID } = req.query;
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

    router.get("/thirdparty", async (req, res, next) => {
        const { webID } = req.query;
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

    router.get("/admin", async (req, res, next) => {
        const { webID } = req.query;
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

    router.put("/update-member", async (req, res, next) => {
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

    router.put("/update-thirdparty", async (req, res, next) => {
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

    router.put("/update-admin", async (req, res, next) => {
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

    router.delete("/remove-data", async (req, res, next) => {
        try {
            const webID = req.query.webID;
            const newMember = new Member();
            await newMember.fetchUser(webID, appSession)
            const user = newMember.toJson();
            await userService.removeData(user.dataSource, appSession);
            res.send({ message: "Data removed successfully." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error in removing data.", error: error.message });
        }
    });

    router.get("/get-member-count", async (req, res, next) => {
        try {
            const date = req.query.date;
            const memberCount = await userService.getMemberCount(date, appSession);
            res.send({ data: memberCount, message: "Member count found." });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: `${appSession.info.sessionId} Error in finding member count.`, error: error.message });
        }
    });

    return router;
};