require("dotenv").config();
const express = require("express");
const cors = require('cors');
const cookieSession = require("cookie-session");
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
app.use(`${api}/project`, ProjectRoute(appSession));
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