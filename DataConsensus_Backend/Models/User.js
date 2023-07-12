const userService = require("../CRUDService/UserService.js");

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
        this.name = solidThing.predicates["http://xmlns.com/foaf/0.1/email"]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
        this.email = solidThing.predicates["http://xmlns.com/foaf/0.1/name"]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
        this.dataSource = solidThing.predicates[`https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/schema/user#dataSource`]["namedNodes"][0];
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
        this.webID = webID;
        this.name = solidThing.predicates["http://xmlns.com/foaf/0.1/name"]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
        this.email = solidThing.predicates["http://xmlns.com/foaf/0.1/email"]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
        this.description = solidThing.predicates[`http://purl.org/dc/terms/description`]["namedNodes"][0];
        this.orgType = solidThing.predicates[`https://w3id.org/dpv#organisation`]["namedNodes"][0];
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
        this.name = solidThing.predicates["http://xmlns.com/foaf/0.1/name"]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
        this.email = solidThing.predicates["http://xmlns.com/foaf/0.1/email"]["literals"]["http://www.w3.org/2001/XMLSchema#string"][0];
    }
}


module.exports = { Member, ThirdParty, Admin };