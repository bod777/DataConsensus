require("dotenv").config();
const express = require("express");
const cors = require('cors');
const cookieSession = require("cookie-session");

const { readFile } = require('fs/promises');
const { overwriteFile, getSourceUrl } = require("@inrupt/solid-client");
const { removeAccess, grantAccess } = require("./AccessControl.js");
const {
    getSessionIdFromStorageAll,
    Session
} = require("@inrupt/solid-client-authn-node");

const AuthRoute = require("./Routes/AuthRoute.js");
const UserRoute = require("./Routes/UserRoute.js");
const PolicyRoute = require("./Routes/PolicyRoute.js");
const VoteRoute = require("./Routes/VoteRoute.js");
const CommentRoute = require("./Routes/CommentRoute.js");

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
setInterval(checkAndRenewSession, 60000);

// app.get("/uploadFile", async (req, res, next) => {
//     uploadFile('C:/myProjects/MSc Programming/CS7CS5_Dissertation/DataConsensus/POD/interactions/votes.ttl', "text/turtle", `https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/interactions/votes.ttl`, appSession.fetch);
//     res.send("<p>Performed overwriting.</p>");
// });

// async function uploadFile(filepath, mimetype, targetURL, fetch) {
//     try {
//         const data = await readFile(filepath);
//         writeFileToPod(data, mimetype, targetURL, fetch);
//     } catch (err) {
//         console.log(err);
//     }
// }

// async function writeFileToPod(filedata, mimetype, targetFileURL, fetch) {
//     try {
//         const savedFile = await overwriteFile(
//             targetFileURL,                   // URL for the file.
//             filedata,                        // Buffer containing file data
//             { contentType: mimetype, fetch: fetch } // mimetype if known, fetch from the authenticated session
//         );
//         console.log(`File saved at ${getSourceUrl(savedFile)}`);
//     } catch (error) {
//         console.error(error);
//     }
// }


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

app.get("/", async (req, res, next) => {
    const sessionIds = await getSessionIdFromStorageAll();
    res.send({
        data:
            `<p>There are currently [${sessionIds.length}] visitors.</p>`
    }
    );
});

app.use(`${api}/auth`, AuthRoute());
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
};