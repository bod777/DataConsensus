require("dotenv").config();
const express = require("express");
const cors = require('cors');
const cookieSession = require("cookie-session");
const { readFile } = require('fs/promises');
const { overwriteFile, getSourceUrl } = require("@inrupt/solid-client");
const {
    getSessionFromStorage,
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");

const VoteRoute = require("./Routes/VoteRoute.js");
const CommentRoute = require("./Routes/CommentRoute.js");
const UserRoute = require("./Routes/UserRoute.js");
const PolicyRoute = require("./Routes/PolicyRoute.js");
const { removeAccess, grantAccess } = require("./AccessControl.js");

const api = process.env.API_URI;
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

const appSession = new Session();

function checkAndRenewSession() {
    if (!appSession.info.isLoggedIn) {
        appSession.login({
            clientId: process.env.APP_CLIENT_ID,
            clientSecret: process.env.APP_CLIENT_SECRET,
            oidcIssuer: process.env.APP_OIDC_ISSUER
        }).then(() => {
            if (appSession.info.isLoggedIn) {
                appSession
                    .fetch(appSession.info.webId)
                    .then((response) => {
                        return response.text();
                    })
                    .then(console.log(`appSession: ${JSON.stringify(appSession.info)}`));
            }
        });
    }
}

checkAndRenewSession();
setInterval(checkAndRenewSession, 240000);

app.use(
    cookieSession({
        name: "session",
        keys: [
            "Required, but value not relevant for this demo - key1",
            "Required, but value not relevant for this demo - key2",
        ],
        maxAge: 24 * 60 * 60 * 1000,
    })
);


let userSession;

app.get("/login", async (req, res, next) => {
    console.log("login");
    userSession = new Session();
    console.log(`userSession: ${JSON.stringify(userSession.info)}`);
    req.session.sessionId = userSession.info.sessionId;

    const redirectToSolidIdentityProvider = (url) => {
        res.redirect(url);
    };

    try {
        await userSession.login({
            redirectUrl: `http://localhost:3000/login/callback`,
            oidcIssuer: process.env.APP_OIDC_ISSUER,
            clientName: "DataConsensus",
            handleRedirect: redirectToSolidIdentityProvider,
        });
    } catch (error) {
        console.error("User login error:", error);
    }
});

app.get("/login/callback", async (req, res) => {
    const sessionId = req.session.sessionId;
    const session = await getSessionFromStorage(sessionId);
    await session.handleIncomingRedirect(`http://localhost:${port}${req.url}`);

    if (session.info.isLoggedIn) {
        console.log(`callback userSession ${JSON.stringify(session.info)}`);
        // Construct the URL with query parameters
        const redirectURL = `http://localhost:4200/login/callback/?isLoggedIn=${session.info.isLoggedIn}&webId=${session.info.webId}`;
        res.redirect(redirectURL);
    }
});

app.get("/fetch-user-resource", async (req, res, next) => {
    console.log("fetch-user-resource");
    console.log(req.session);
    console.log(req.session.sessionId);
    if (typeof req.query["resource"] === "undefined") {
        res.send(
            "<p>Please pass the (encoded) URL of the Resource you want to fetch using `?resource=&lt;resource URL&gt;`.</p>"
        );
    }
    else {
        const userSession = await getSessionFromStorage(req.session.sessionId);
        console.log(userSession.info.webId);
        console.log(await (await userSession.fetch(req.query["resource"])).text());
        res.send("<p>Performed authenticated fetch.</p>");
    }
    next();
});

app.get("/fetch-app-resource", async (req, res, next) => {
    if (typeof req.query["resource"] === "undefined") {
        res.send(
            "<p>Please pass the (encoded) URL of the Resource you want to fetch using `?resource=&lt;resource URL&gt;`.</p>"
        );
    }
    else {
        const resource = await (await appSession.fetch(req.query["resource"])).text();
        console.log(resource);
        // console.log(await (await appSession.fetch(req.query["resource"])).text());
        // const response = await fetch(req.query["resource"]);
        // const contentType = response.headers.get('content-type');
        // console.log('Resource Type:', contentType);
        res.send(resource);
    }
});

app.get("/delete-app", async (req, res, next) => {
    uploadFile('C:/myProjects/MSc Programming/CS7CS5_Dissertation/DataConsensus/POD/schemas/project.ttl', "text/turtle", `https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schemas/project.ttl`, appSession.fetch);
    res.send("<p>Performed overwriting.</p>");
});

async function uploadFile(filepath, mimetype, targetURL, fetch) {
    try {
        const data = await readFile(filepath);
        writeFileToPod(data, mimetype, targetURL, fetch);
    } catch (err) {
        console.log(err);
    }
}

async function writeFileToPod(filedata, mimetype, targetFileURL, fetch) {
    try {
        const savedFile = await overwriteFile(
            targetFileURL,                   // URL for the file.
            filedata,                        // Buffer containing file data
            { contentType: mimetype, fetch: fetch } // mimetype if known, fetch from the authenticated session
        );
        console.log(`File saved at ${getSourceUrl(savedFile)}`);
    } catch (error) {
        console.error(error);
    }
}

app.get("/grant-access", async (req, res, next) => {
    const thirdparty = "https://id.inrupt.com/odonneb4";
    grantAccess(thirdparty, appSession);
    res.send(`SUCCESS`);
});

app.get("/logout", async (req, res, next) => {
    const userSession = await getSessionFromStorage(req.userSession.sessionId);
    userSession.logout();
    res.send(`<p>Logged out.</p>`);
});

app.get("/", async (req, res, next) => {
    const sessionIds = await getSessionIdFromStorageAll();
    res.send({
        data:
            `<p>There are currently [${sessionIds.length}] visitors.</p>`
    }
    );
});

app.use(`${api}/user`, UserRoute(appSession));
app.use(`${api}/policy`, PolicyRoute(appSession));
app.use(`${api}/vote`, VoteRoute(appSession));
app.use(`${api}/comment`, CommentRoute(appSession));

app.listen(port, () => {
    console.log(
        `Server running on port [${port}]. ` +
        `Visit [http://localhost:${port}/login] to log in to [login.inrupt.com].`
    );
});

module.exports = {
    appSession
    // userSession
};