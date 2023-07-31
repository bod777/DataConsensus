const userService = require("../CRUDService/UserService.js");
const { FOAF, DCTERMS, XSD } = require("@inrupt/vocab-common-rdf");
const { extractTerm } = require("../HelperFunctions.js");

const dpv = process.env.DPV;
const user = process.env.USER;

class User {
    constructor(webID, name, email, date) {
        this.webID = webID;
        this.name = name;
        this.email = email;
        this.issued = new Date(date);
    }


    toJson() {
        return {
            webID: this.webID,
            name: this.name,
            email: this.email,
            issued: this.issued
        };
    }
}

class Member extends User {
    constructor(webID, name, email, issued, dataSource) {
        super(webID, name, email, issued);
        this.dataSource = dataSource;
    }

    async fetchUser(webID, session) {
        const solidThing = await userService.getUser({ webID, type: "MEMBER" }, session);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name]["literals"][XSD.string][0];
        this.email = solidThing.predicates[FOAF.mbox]["literals"][XSD.string][0];
        this.issued = new Date(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
        this.dataSource = solidThing.predicates[`${user}#dataSource`]["namedNodes"][0];
    }

    toJson() {
        return {
            webID: this.webID,
            name: this.name,
            email: this.email,
            issued: this.issued,
            dataSource: this.dataSource
        };
    }
}

class ThirdParty extends User {
    constructor(webID, name, email, issued, description, org) {
        super(webID, name, email, issued);
        this.description = description;
        this.orgType = org;
    }

    async fetchUser(webID, session) {
        const solidThing = await userService.getUser({ webID, type: "THIRDPARTY" }, session);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name]["literals"][XSD.string][0];
        this.email = solidThing.predicates[FOAF.mbox]["literals"][XSD.string][0];
        this.issued = new Date(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
        this.description = solidThing.predicates[DCTERMS.description]["literals"][XSD.string][0];
        this.orgType = extractTerm(solidThing.predicates[`${dpv}Organisation`]["namedNodes"][0]);
    }

    toJson() {
        return {
            webID: this.webID,
            name: this.name,
            email: this.email,
            issued: this.issued,
            description: this.description,
            orgType: this.orgType
        };
    }
}

class Admin extends User {
    constructor(webID, name, email, issued) {
        super(webID, name, email, issued);
    }

    async fetchUser(webID, session) {
        const solidThing = await userService.getUser({ webID, type: "ADMIN" }, session);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name]["literals"][XSD.string][0];
        this.email = solidThing.predicates[FOAF.mbox]["literals"][XSD.string][0];
        this.issued = new Date(solidThing.predicates[DCTERMS.issued]["literals"][XSD.dateTime][0]);
    }
}


module.exports = { Member, ThirdParty, Admin };