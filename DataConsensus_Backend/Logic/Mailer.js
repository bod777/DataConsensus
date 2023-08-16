const nodemailer = require('nodemailer');
const { universalAccess } = require("@inrupt/solid-client");
const { ThirdParty } = require("../Models/User");
require("dotenv").config();

const resource = process.env.RESOURCE_URL;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: email,
        pass: password
    }
});
const newMember = {
    from: email,
    subject: 'Updated Data Consensus Data',
    text: 'A new member has joined the DataConsensus Group. Their data has been added to the data pool. You can access the data by logging into a general pod browser and navigating to the following: https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/data/Resource.csv'
};
const deletedMember = {
    from: email,
    subject: 'URGENT ACTION - Deletion Notification',
    text: 'A member has recinded their consent and removed their data from the DataConsensus Group. Their data has been removed to the data pool. Please DELETE any of the previously shared data you have from the DataConsensus and please redownloaded the data. You can access the data by logging into a general pod browser and navigating to the following: https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/data/Resource.csv'
};
async function logAccessInfo(agent, agentAccess, resource) {
    console.log(`For resource::: ${resource}`);
    if (agentAccess === null) {
        console.log(`Could not load ${agent}'s access details.`);
    } else {
        console.log(`${agent}'s Access:: ${JSON.stringify(agentAccess)}`);
    }
}
async function getControllers(session) {
    const controllers = [];
    await universalAccess.getAgentAccessAll(
        resource, // resource
        { fetch: session.fetch }                // fetch function from authenticated session
    ).then(async (accessByAgent) => {
        for (const [agent, agentAccess] of Object.entries(accessByAgent)) {
            logAccessInfo(agent, agentAccess, resource);
            const fetchedThirdParty = new ThirdParty();
            await fetchedThirdParty.fetchUser(agent, session);
            controllers.push(fetchedThirdParty.toJson());
        }
    });
    return controllers;
}

module.exports = {
    sendDeletionNotification: async function (session) {
        const controllers = await getControllers(session);
        controllers.forEach((controller) => {
            deletedMember.to = controller.email;
            transporter.sendMail(deletedMember, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
    },

    sendNewDataNotification: async function (session) {
        const controllers = await getControllers(session);
        controllers.forEach((controller) => {
            newMember.to = controller.email;
            transporter.sendMail(newMember, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
    }
}