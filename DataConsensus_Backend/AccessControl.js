require("dotenv").config();

// ... import statement for authentication, which includes the fetch function, is omitted for brevity.

const { universalAccess } = require("@inrupt/solid-client");

const resourceURL = process.env.RESOURCE_URL;

async function grantAccess(thirdParty, session) {
    universalAccess.setAgentAccess(
        resourceURL,
        thirdParty,
        { read: true, write: false, },          // Access object
        { fetch: session.fetch }                         // fetch function from authenticated session
    ).then((newAccess) => {
        console.log(`For resource::: ${resourceURL}`);
        if (newAccess === null) {
            console.log(`Could not load ${thirdParty}'s access details.`);
        } else {
            console.log(`${thirdParty}'s Access:: ${JSON.stringify(newAccess)}`);
        }
    });
}

async function removeAccess(thirdParty, session) {
    universalAccess.setAgentAccess(
        resourceURL,
        thirdParty,
        { read: false, write: false, },          // Access object
        { fetch: session.fetch }                         // fetch function from authenticated session
    ).then((newAccess) => {
        console.log(`For resource::: ${resourceURL}`);
        if (newAccess === null) {
            console.log(`Could not load ${thirdParty}'s access details.`);
            return `Could not load ${thirdParty}'s access details.`;
        } else {
            console.log(`${thirdParty}'s Access:: ${JSON.stringify(newAccess)}`);
            return `${thirdParty}'s Access:: ${JSON.stringify(newAccess)}`;
        }
    });
}

module.exports = { grantAccess, removeAccess };
