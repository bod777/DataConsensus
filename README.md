# DataConsensus
**Abstract:**
Despite the wealth of data within the world, health researchers struggle with high regulatory and technical burdens to gather data necessary for their work. Enabling more data sharing while preserving rights and privacy is the key objective of the European Strategy for Data and the focus of this research. Specifically this work tackles the question “How to enable data cooperatives to collaboratively deliberate and decide on interoperable data requests from third parties?" by proposing the DataConsensus application, a tool built on Solid to manage data requests for a group of Nightscout users. While tailored for a specific community, the project's contributions can be adapted to other scenarios due to its interoperability emphasis. This work proposes the ODRL Profile for Collective Policies (OCP), to define and track policies within the DataConsensus system using existing vocabularies including the Digital Rights Language. Along with the use of the Solid specification, this ensures the interoperability and transparency of the application. Additionally, the application promotes collaborative decision-making through its proposed decision process, allowing members to propose counter offers to third parties. Furthermore, this work is evaluated against its data policy checklist and community related guidelines, which can be utilised against future research. In conclusion, the project has made significant contributions to research on data cooperatives.

## Set Up Instructions
To set up this application in a local environment, clone the GitHub repository into a directory of your choice. The base directory contains three folders: DataConsensus_Backend, DataConsensus_Frontend and POD. The latter contains the demo files for the DataConsensus application. 

To set up your own version of the application, you will need to create a WebID and pod to serve as the DataConsensus pod. You can do that [here](https://start.inrupt.com/). 
Additionally, you will need to register an app to your new WebID and Pod. Take note of the client id and secret. You can do that [here](https://login.inrupt.com/registration.html).
Once you have a pod set up to serve as your DataConsensus pod, upload the files in the POD folder. You may want to change the admins.ttl file to include your personal WebID so you can access all aspects of the frontend.
Furthermore, you will need to create an app password for an email of your choice. To create one using google, follow these [instructions](https://support.google.com/mail/answer/185833?hl=en).

The public GitHub repository is missing the .env file located in the DataConsensus_Backend directory. It contains a number of essential constants used through the application’s backend. These include the URLs of the DataConsensus pod used in development and testing and other constants that cannot be shared. Therefore, you will need to create a new .env with new constants. A list of the constants to include can be seen in Table XXX.

| Name     | Example |
|----------|---------|
|FRONTEND|http://localhost:4200|
|HOSTNAME|http://localhost:|
|PORT|3000|
|API_URI|/api/v1|
|ODRL |http://www.w3.org/ns/odrl/2/|
|DPV |"https://w3id.org/dpv#"|
|OAC |"https://w3id.org/oac#"|
|DPVLEGAL |"https://www.w3id.org/dpv/dpv-legal#"|
|USER|<YOUR_POD_LOCATION>/app/schemas/user.ttl|
|COMMENT|<YOUR_POD_LOCATION>/app/schemas/comment.ttl|
|OCP|<YOUR_POD_LOCATION>/app/schemas/ocp.ttl|
|PROJECT|<YOUR_POD_LOCATION>/app/schemas/project.ttl|
|VOTE|<YOUR_POD_LOCATION>/app/schemas/vote.ttl|
|MEMBER_LIST |<YOUR_POD_LOCATION>/app/members.ttl|
|THIRDPARTY_LIST |<YOUR_POD_LOCATION>/app/third-parties.ttl|
|ADMIN_LIST |<YOUR_POD_LOCATION>/app/admins.ttl|
|REQUESTS |<YOUR_POD_LOCATION>/app/requests.ttl|
|OFFERS |<YOUR_POD_LOCATION>/app/offers.ttl|
|AGREEMENTS |<YOUR_POD_LOCATION>/app/agreements.ttl|
|COMMENTS |<YOUR_POD_LOCATION>/app/comments.ttl|
|VOTES |<YOUR_POD_LOCATION>/app/votes.ttl|
|PROJECTS |<YOUR_POD_LOCATION>/app/projects.ttl|
|SECRET|A sha 256 secret for the hashing function|
|APP_CLIENT_ID|This is the client id you received when you registered your app|
|APP_CLIENT_SECRET|This is the client secret you received when you registered your app|
|EMAIL|An email of your choice|
|PASSWORD|The app password for the email of your choice|
|APP_OIDC_ISSUER|https://login.inrupt.com|
|RESOURCE_URL|<YOUR_POD_LOCATION>/app/pool/datapool.csv|


In the directory where the cloned repo is located, open two terminals and in the first terminal, run the following commands:

```
cd DataConsensus_Backend
npm install
npm start
```
In the second terminal, run the following commands:
```
cd DataConsensus_Frontend
ng build
ng serve
```
