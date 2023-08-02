require("dotenv").config();
const router = require("express").Router();
const {
    getSessionFromStorage,
    Session
} = require("@inrupt/solid-client-authn-node");

const FRONTEND = process.env.FRONTEND;
const HOSTNAME = process.env.HOSTNAME;
const api = process.env.API_URI;
const port = process.env.PORT || 3000;

module.exports = function () {

    let userSession;

    router.get("/thirdparty-signup", async (req, res, next) => {
        userSession = new Session();
        req.session.sessionId = userSession.info.sessionId;

        const redirectToSolidIdentityProvider = (url) => {
            res.redirect(url);
        };

        try {
            await userSession.login({
                redirectUrl: `${HOSTNAME}${port}${api}/auth/thirdparty-signup/callback`,
                oidcIssuer: issuer,
                clientName: "DataConsensus",
                handleRedirect: redirectToSolidIdentityProvider,
            });
        } catch (error) {
            console.error("User login error:", error);
        }
    });

    router.get("/thirdparty-signup/callback", async (req, res) => {
        const sessionId = req.session.sessionId;
        const session = await getSessionFromStorage(sessionId);
        await session.handleIncomingRedirect(`${HOSTNAME}${port}${api}/auth${req.url}`);
        if (session.info.isLoggedIn) {
            const redirectURL = `${FRONTEND}/thirdparty-signup/?isLoggedIn=${session.info.isLoggedIn}&webId=${session.info.webId}&sessionId=${sessionId}`;
            res.redirect(redirectURL);
        }
    });

    router.get("/member-signup", async (req, res, next) => {
        const issuer = req.query.issuer || process.env.APP_OIDC_ISSUER;
        userSession = new Session();
        req.session.sessionId = userSession.info.sessionId;

        const redirectToSolidIdentityProvider = (url) => {
            res.redirect(url);
        };

        try {
            await userSession.login({
                redirectUrl: `${HOSTNAME}${port}${api}/auth/member-signup/callback`,
                oidcIssuer: issuer,
                clientName: "DataConsensus",
                handleRedirect: redirectToSolidIdentityProvider,
            });
        } catch (error) {
            console.error("User login error:", error);
        }
    });

    router.get("/member-signup/callback", async (req, res) => {
        const sessionId = req.session.sessionId;
        const session = await getSessionFromStorage(sessionId);
        await session.handleIncomingRedirect(`${HOSTNAME}${port}${api}/auth${req.url}`);
        if (session.info.isLoggedIn) {
            const redirectURL = `${FRONTEND}/member-signup/?isLoggedIn=${session.info.isLoggedIn}&webId=${session.info.webId}&sessionId=${sessionId}`;
            res.redirect(redirectURL);
        }
    });

    router.get("/login", async (req, res, next) => {
        const issuer = req.query.issuer || process.env.APP_OIDC_ISSUER;
        userSession = new Session();
        req.session.sessionId = userSession.info.sessionId;

        const redirectToSolidIdentityProvider = (url) => {
            res.redirect(url);
        };

        try {
            await userSession.login({
                redirectUrl: `${HOSTNAME}${port}${api}/auth/login/callback`,
                oidcIssuer: issuer,
                clientName: "DataConsensus",
                handleRedirect: redirectToSolidIdentityProvider,
            });
        } catch (error) {
            console.error("User login error:", error);
        }
    });

    router.get("/login/callback", async (req, res) => {
        const sessionId = req.session.sessionId;
        const session = await getSessionFromStorage(sessionId);
        await session.handleIncomingRedirect(`${HOSTNAME}${port}${api}/auth${req.url}`);
        if (session.info.isLoggedIn) {
            const redirectURL = `${FRONTEND}/login/callback/?isLoggedIn=${session.info.isLoggedIn}&webId=${session.info.webId}&sessionId=${session.info.sessionId}`;
            res.redirect(redirectURL);
        }
    });

    router.get("/refresh-session", async (req, res, next) => {
        const issuer = req.query.issuer || process.env.APP_OIDC_ISSUER;
        userSession = new Session();
        req.session.sessionId = userSession.info.sessionId;
        const redirectToSolidIdentityProvider = (url) => {
            res.redirect(url);
        };

        try {
            await userSession.login({
                redirectUrl: `${HOSTNAME}${port}${api}/auth/refresh-session/callback`,
                oidcIssuer: issuer,
                clientName: "DataConsensus",
                handleRedirect: redirectToSolidIdentityProvider,
            });
        } catch (error) {
            console.error("User login error:", error);
        }
    });

    router.get("/refresh-session/callback", async (req, res) => {
        const sessionId = req.session.sessionId;
        const session = await getSessionFromStorage(sessionId);
        await session.handleIncomingRedirect(`${HOSTNAME}${port}${api}/auth${req.url}`);
        if (session.info.isLoggedIn) {
            const redirectURL = `${FRONTEND}/profile?webID=${session.info.webId}&sessionId=${session.info.sessionId}`;
            res.redirect(redirectURL);
        }
    });

    router.get("/logout", async (req, res, next) => {
        const userSession = await getSessionFromStorage(req.userSession.sessionId);
        userSession.logout();
        res.redirect(`${FRONTEND}`);
    });

    return router;
};