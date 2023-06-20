class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password; // in real-world application, never store password as plain text
  }

  // Some shared method
  displayUserInfo() {
    console.log(`User: ${this.name}, Email: ${this.email}`);
  }
}

class Member extends User {
  constructor(name, email, password, memberSpecificData) {
    super(name, email, password);
    this.memberSpecificData = memberSpecificData;
  }

  // Methods specific to members
  displayMemberData() {
    console.log(this.memberSpecificData);
  }
}

class ThirdParty extends User {
  constructor(name, email, password, thirdPartySpecificData) {
    super(name, email, password);
    this.thirdPartySpecificData = thirdPartySpecificData;
  }

  // Methods specific to third party users
  displayThirdPartyData() {
    console.log(this.thirdPartySpecificData);
  }
}

class Admin extends User {
  constructor(name, email, password, adminSpecificData) {
    super(name, email, password);
    this.adminSpecificData = adminSpecificData;
  }

  // Methods specific to admins
  displayAdminData() {
    console.log(this.adminSpecificData);
  }
}
