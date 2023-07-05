require("dotenv").config();

// ... import statement for authentication, which includes the fetch function, is omitted for brevity.

import { universalAccess } from "@inrupt/solid-client";

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

// import { handleIncomingRedirect, login, fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
// import { acp_ess_2, asUrl } from "@inrupt/solid-client";


// // ... Various logic, including login logic, omitted for brevity.
// // ...


// async function grantAccess(resoureURL, thirdParty) {

//     try {
//         // 1. Fetch the SolidDataset with its Access Control Resource (ACR).
//         let resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
//             resoureURL,            // Resource whose ACR to set up
//             { fetch: fetch }       // fetch from the authenticated session
//         );

//         // 2. Initialize a new Matcher.
//         let thirdPartyMatcher = acp_ess_2.createResourceMatcherFor(
//             resourceWithAcr,
//             "match-third-party"
//         );

//         // 3. For the Matcher, specify the Agent(s) to match.
//         thirdParty.forEach(agent => {
//             thirdPartyMatcher = acp_ess_2.addAgent(appFriendsMatcher, agent);
//         })

//         // 5. Add the Matcher definition to the Resource's ACR.
//         resourceWithAcr = acp_ess_2.setResourceMatcher(
//             resourceWithAcr,
//             thirdPartyMatcher
//         );

//         // 6. Create a Policy for the Matcher.
//         let thirdPartyPolicy = acp_ess_2.createResourcePolicyFor(
//             resourceWithAcr,
//             "third-party-policy",
//         );

//         // 7. Add the appFriendsMatcher to the Policy as an allOf() expression.
//         // Since using allOf() with a single Matcher, could also use anyOf() expression

//         thirdPartyPolicy = acp_ess_2.addAllOfMatcherUrl(
//             thirdPartyPolicy,
//             thirdPartyMatcher
//         );

//         // 8. Specify the access modes (e.g., allow Read and Write).
//         thirdPartyPolicy = acp_ess_2.setAllowModes(appFriendsPolicy,
//             { read: true, write: false }
//         );

//         // 9. Apply the Policy to the resource.
//         resourceWithAcr = acp_ess_2.addPolicyUrl(
//             resourceWithAcr,
//             asUrl(thirdPartyPolicy)
//         );

//         // 10. Add the Policy definition to the resource's ACR.
//         resourceWithAcr = acp_ess_2.setResourcePolicy(
//             resourceWithAcr,
//             thirdPartyPolicy
//         );

//         // 11. Save the modified ACR for the resource.
//         const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
//             resourceWithAcr,
//             { fetch: fetch }          // fetch from the authenticated session
//         );
//     } catch (error) {
//         console.error(error.message);
//     }
// }

// async function removeAccess(resourceURL, policyName) {
//     try {
//         // 1. Fetch the SolidDataset with its Access Control Resource (ACR).
//         let resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
//         resourceURL,           // Resource whose policy you want to delete
//         { fetch: fetch }       // fetch from the authenticated session
//         );

//         // 2. Remove the Policy definition from the ACR
//         resourceWithAcr = acp_ess_2.removeResourcePolicy(resourceWithAcr, policyName);

//         // 3. Save the ACR for the Resource.
//         const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
//         resourceWithAcr,
//         { fetch: fetch }          // fetch from the authenticated session
//         );
//     } catch (error) {
//         console.error(error.message);
//     }
// }