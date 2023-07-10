require("dotenv").config();
const express = require("express");
const cookieSession = require("cookie-session");

const {
  getSessionFromStorage,
  getSessionIdFromStorageAll,
  Session,
} = require("@inrupt/solid-client-authn-node");

const InteractionRoute = require("./Routes/InteractionRoute.js");
const UserRoute = require("./Routes/UserRoute.js");
const PolicyRoute = require("./Routes/PolicyRoute.js");

const app = express();
const api = process.env.API_URI;
const port = process.env.PORT || 3000;

const appSession = new Session();
appSession.login({
  // 2. Use the authenticated credentials to log in the session.
  clientId: process.env.APP_CLIENT_ID,
  clientSecret: process.env.APP_CLIENT_SECRET,
  oidcIssuer: process.env.APP_OIDC_ISSUER
}).then(() => {
  if (appSession.info.isLoggedIn) {
    // 3. Your session should now be logged in, and able to make authenticated requests.
    appSession
      // You can change the fetched URL to a private resource, such as your Pod root.
      .fetch(appSession.info.webId)
      .then((response) => {
        return response.text();
      })
      .then(console.log(appSession.info.webId));
  }
});
console.log(appSession.info.sessionId);

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

app.get("/login", async (req, res, next) => {
  const userSession = new Session();
  req.session.sessionId = userSession.info.sessionId;

  const redirectToSolidIdentityProvider = (url) => {
    res.redirect(url);
  };

  try {
    await userSession.login({
      redirectUrl: `http://localhost:${port}/login/callback`,
      oidcIssuer: process.env.APP_OIDC_ISSUER,
      clientName: "DataConsensus",
      handleRedirect: redirectToSolidIdentityProvider,
    });
  } catch (error) {
    console.error("User login error:", error);
  }
});

app.get("/login/callback", async (req, res) => {
  const userSession = await getSessionFromStorage(req.session.sessionId);
  console.log(`http://localhost:${port}${req.url}`);
  await userSession.handleIncomingRedirect(`http://localhost:${port}${req.url}`);

  if (userSession.info.isLoggedIn) {
    return res.send(`<p>Logged in with the WebID ${userSession.info.webId}.</p>`)
  }
});

app.get("/fetch-user-resource", async (req, res, next) => {
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
});

app.get("/fetch-app-resource", async (req, res, next) => {
  if (typeof req.query["resource"] === "undefined") {
    res.send(
      "<p>Please pass the (encoded) URL of the Resource you want to fetch using `?resource=&lt;resource URL&gt;`.</p>"
    );
  }
  else {
    console.log(appSession.info.webId);
    console.log(await (await appSession.fetch(req.query["resource"])).text());
    res.send("<p>Performed authenticated fetch.</p>");
  }
});

app.get("/logout", async (req, res, next) => {
  const userSession = await getSessionFromStorage(req.userSession.sessionId);
  userSession.logout();
  res.send(`<p>Logged out.</p>`);
});

app.get("/", async (req, res, next) => {
  const sessionIds = await getSessionIdFromStorageAll();
  res.send(
    `<p>There are currently [${sessionIds.length}] visitors.</p>`
  );
});

app.use(`${api}/user`, UserRoute);
app.use(`${api}/policy`, PolicyRoute);
app.use(`${api}/interaction`, InteractionRoute);

app.listen(port, () => {
  console.log(
    `Server running on port [${port}]. ` +
    `Visit [http://localhost:${port}/login] to log in to [login.inrupt.com].`
  );
});

module.exports = {
  appSession,
  userSession
};