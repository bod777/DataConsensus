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

const InteractionUtil = require('./Routes/InteractionUtil.js');
const UserUtil = require('./Routes/UserUtil.js');
const ProposalUtil = require('./Routes/ProposalUtil.js');

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

app.use(`${api}`, UserUtil);
app.use(`${api}`, ProposalUtil);
app.use(`${api}`, InteractionUtil);

app.listen({ port }, () => {
  console.log('Server is running on port 3000')
});