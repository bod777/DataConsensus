const userService = require("../CRUDService/UserService.js");
const { FOAF, DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");

const user = process.env.USER;

class User {
    constructor(webID, name, email) {
        this.webID = webID;
        this.name = name;
        this.email = email;
    }

    // Some shared method
    displayUserInfo() {
        console.log(`WebID: ${this.webID}, Name: ${this.name}, Email: ${this.email}`);
    }

    getUser() {
        return this;
    }

    toJson() {
        return {
            webID: this.webID,
            name: this.name,
            email: this.email
        };
    }
}

class Member extends User {
    constructor(webID, name, email, dataSource) {
        super(webID, name, email);
        this.dataSource = dataSource;
    }

    async fetchUser(webID, session) {
        const solidThing = await userService.getUser({ webID, type: "MEMBER" }, session);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name]["literals"][XSD.string][0];
        this.email = solidThing.predicates[FOAF.mbox]["literals"][XSD.string][0];
        this.dataSource = solidThing.predicates[`${user}#dataSource`]["namedNodes"][0];
    }

    toJson() {
        return {
            webID: this.webID,
            name: this.name,
            email: this.email,
            dataSource: this.dataSource
        };
    }
}

class ThirdParty extends User {
    constructor(webID, name, email, description, org) {
        super(webID, name, email);
        this.description = description;
        this.orgType = org;
    }

    async fetchUser(webID, session) {
        const solidThing = await userService.getUser({ webID, type: "THIRDPARTY" }, session);
        console.log(JSON.stringify(solidThing));
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name]["literals"][XSD.string][0];
        this.email = solidThing.predicates[FOAF.mbox]["literals"][XSD.string][0];
        this.description = solidThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        this.orgType = solidThing.predicates[DCTERMS.Organisation]["namedNodes"][0];
    }

    toJson() {
        return {
            webID: this.webID,
            name: this.name,
            email: this.email,
            dataSource: this.description,
            orgType: this.orgType
        };
    }
}

class Admin extends User {
    constructor(webID, name, email) {
        super(webID, name, email);
    }

    async fetchUser(webID, session) {
        const solidThing = await userService.getUser({ webID, type: "ADMIN" }, session);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name]["literals"][XSD.string][0];
        this.email = solidThing.predicates[FOAF.mbox]["literals"][XSD.string][0];
    }
}


module.exports = { Member, ThirdParty, Admin };