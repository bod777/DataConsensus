require("dotenv").config();

// ... import statement for authentication, which includes the fetch function, is omitted for brevity.

const { universalAccess } = require("@inrupt/solid-client");


async function grantAccess(agent, fileURL, session) {
    universalAccess.setAgentAccess(
        fileURL,
        agent,
        { read: true, write: false, },          // Access object
        { fetch: session.fetch }                         // fetch function from authenticated session
    ).then((newAccess) => {
        console.log(`For resource::: ${fileURL}`);
        if (newAccess === null) {
            console.log(`Could not load ${agent}'s access details.`);
        } else {
            console.log(`${agent}'s Access:: ${JSON.stringify(newAccess)}`);
        }
    });
}

async function removeAccess(agent, fileURL, session) {
    universalAccess.setAgentAccess(
        fileURL,
        agent,
        { read: false, write: false, },          // Access object
        { fetch: session.fetch }                         // fetch function from authenticated session
    ).then((newAccess) => {
        console.log(`For resource::: ${fileURL}`);
        if (newAccess === null) {
            console.log(`Could not load ${agent}'s access details.`);
            return `Could not load ${agent}'s access details.`;
        } else {
            console.log(`${agent}'s Access:: ${JSON.stringify(newAccess)}`);
            return `${agent}'s Access:: ${JSON.stringify(newAccess)}`;
        }
    });
}

module.exports = { grantAccess, removeAccess };
