require("dotenv").config();
const express = require('express');
const express = require("express");
const cookieSession = require("cookie-session");
const cors = require('cors');
const {
  getSessionFromStorage,
  getSessionIdFromStorageAll,
  Session
} = require("@inrupt/solid-client-authn-node");

const InteractionRoute = require('./Routes/InteractionRoute.js');
const UserRoute = require('./Routes/UserRoute.js');
const PolicyRoute = require('./Routes/PolicyRoute.js');

const api = process.env.API_URI;
const port = process.env.PORT || 3000;

let applicationSession; // to store the session information

//app session to use app pod
const session = new Session();

const app = express();

// end point to check the app connection
app.get('/checkSession', function (req, res) {
  res.send(session.info);
});

app.use(
  cookieSession({
    name: "session",
    keys: [
      "Required, but value not relevant for this demo - key1",
      "Required, but value not relevant for this demo - key2",
    ],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
); // to identify each user's session with a cookie. 
app.use(cors()); // enables Cross-Origin Resource Sharing.
app.use(express.urlencoded()); // parse URL-encoded data sent in requsest body
app.use(express.json()); // parse JSON data sent in request body

// // 6. Once you are logged in, you can retrieve the session from storage, 
// //    and perform authenticated fetches.
// app.get("/fetch", async (req, res, next) => {
//   if (typeof req.query["resource"] === "undefined") {
//     res.send(
//       "<p>Please pass the (encoded) URL of the Resource you want to fetch using `?resource=&lt;resource URL&gt;`.</p>"
//     );
//   }
//   const session = await getSessionFromStorage(req.session.sessionId);
//   console.log(await (await session.fetch(req.query["resource"])).text());
//   res.send("<p>Performed authenticated fetch.</p>");
// });

// // On the server side, you can also list all registered sessions using the getSessionIdFromStorageAll function.
// app.get("/", async (req, res, next) => {
//   const sessionIds = await getSessionIdFromStorageAll();
//   for (const sessionId in sessionIds) {
//       // Do something with the session ID...
//   }
//   res.send(
//       `<p>There are currently [${sessionIds.length}] visitors.</p>`
//   );
// });

app.use(`${api}`, UserRoute);
app.use(`${api}`, PolicyRoute);
app.use(`${api}`, InteractionRoute);

app.listen({ port }, () => {
  console.log('Server is running on port 3000')
});