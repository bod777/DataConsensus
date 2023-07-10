const { FOAF, DCTERMS } = require("@inrupt/vocab-common-rdf");
const service = require("../CRUDService.js");
const user = process.env.USER;
const dpv = "https://w3id.org/dpv#"

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

    fetchUser(webID) {
        const solidThing = service.getUser(`${webID}`);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name].namedNodes[0];
        this.email = solidThing.predicates[FOAF.email].literals["http://www.w3.org/2001/XMLSchema#string"][0];
    }

    getUser() {
        return this;
    }
}

class Member extends User {
    constructor(webID, name, email, dataSource) {
        super(webID, name, email);
        this.dataSource = dataSource;
    }

    fetchUser(webID) {
        const solidThing = service.getUser(`${webID}`);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name].namedNodes[0];
        this.email = solidThing.predicates[FOAF.email].literals["http://www.w3.org/2001/XMLSchema#string"][0];
        this.dataSource = solidThing.predicates[`${user}/dataSource`].namedNodes[0];
    }
}

class ThirdParty extends User {
    constructor(webID, name, email, description, org) {
        super(webID, name, email);
        this.description = description;
        this.orgType = org;
    }

    fetchUser(webID) {
        const solidThing = service.getUser(`${webID}`);
        this.webID = webID;
        this.name = solidThing.predicates[FOAF.name].namedNodes[0];
        this.email = solidThing.predicates[FOAF.email].literals["http://www.w3.org/2001/XMLSchema#string"][0];
        this.description = solidThing.predicates[DCTERMS.description].namedNodes[0];
        this.orgType = solidThing.predicates[`${dpv}/organisation`].namedNodes[0];
    }
}

class Admin extends User {
    constructor(webID, name, email) {
        super(webID, name, email);
    }
}


module.exports = { Member, ThirdParty, Admin };