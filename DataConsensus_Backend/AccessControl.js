require("dotenv").config();

// ... import statement for authentication, which includes the fetch function, is omitted for brevity.

const { universalAccess } = require("@inrupt/solid-client");


const resoureURL = process.env.RESOURCE_URL;

async function grantAccess(thirdParty) {
    universalAccess.setAgentAccess(
        resoureURL,
        thirdParty,
        { read: true, write: false, },          // Access object
        { fetch: fetch }                         // fetch function from authenticated session
    ).then((newAccess) => {
        console.log(`For resource::: ${resource}`);
        if (newAccess === null) {
            console.log(`Could not load ${agent}'s access details.`);
        } else {
            console.log(`${agent}'s Access:: ${JSON.stringify(newAccess)}`);
        }
    });
}

async function removeAccess(thirdParty) {
    universalAccess.setAgentAccess(
        resoureURL,
        thirdParty,
        { read: false, write: false, },          // Access object
        { fetch: fetch }                         // fetch function from authenticated session
    ).then((newAccess) => {
        console.log(`For resource::: ${resource}`);
        if (newAccess === null) {
            console.log(`Could not load ${agent}'s access details.`);
        } else {
            console.log(`${agent}'s Access:: ${JSON.stringify(newAccess)}`);
        }
    });
}

module.exports = { grantAccess, removeAccess };
