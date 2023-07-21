import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { login, getDefaultSession, handleIncomingRedirect, onSessionRestore } from "@inrupt/solid-client-authn-browser";
import { UserService } from '../services/userservice.service';

@Component({
    selector: 'app-login', // This is the CSS selector that Angular uses to identify this component in a template.
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

    constructor(private route: Router, private userService: UserService) { }

    loginInput?: string = "https://login.inrupt.com";
    validate: boolean = false;
    isLoggingIn: boolean = false;
    isSigningUp: boolean = false;
    session = getDefaultSession();

    async login() {
        this.isLoggingIn = true;
        this.isSigningUp = false;
    }

    async signUp() {
        this.isSigningUp = true;
        this.isLoggingIn = false;
    }

    async confirmLogin() {
        return login({
            oidcIssuer: this.loginInput,
            redirectUrl: window.location.href,
            clientName: "Testing"
        });
        // this.authService.login().subscribe(data => {
        //     console.log(data);
        // });
    }

    async ngOnInit() {

        // doesn't work at refresh
        // await this.session.handleIncomingRedirect({ url: window.location.href });
        // if (this.session.info.isLoggedIn) {
        //     console.log("Logged in as " + this.session.info.webId);
        //     this.route.navigate(['/home']);
        // }
        // onSessionRestore((url) => {
        //     this.route.navigateByUrl(url);
        // });

        // works at refresh but only the frontend
        let sessionInfo: any;
        sessionInfo = await handleIncomingRedirect({ restorePreviousSession: true });

        console.log(JSON.stringify(sessionInfo))
        if (sessionInfo) {
            if (sessionInfo.webId) {
                this.userService.checkUser(sessionInfo.webId).subscribe(
                    (response) => {
                        const isUser = response.message === "User found.";
                        const userType = response.data;
                        localStorage.setItem("webID", sessionInfo.webId);
                        if (isUser) {
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("userType", userType);
                        } else {
                            localStorage.setItem("isLoggedIn", "false");
                            localStorage.setItem("userType", "undefined");
                        }
                        console.log("Logged in as " + sessionInfo.webId);
                        this.route.navigate(['/home']);
                    },
                    (error) => {
                        console.log(error);
                    }
                );
                // const response = await this.authService.checkUser(sessionInfo.webId);
                // console.log("Test2", JSON.stringify(response));
                // const isUser = response.message === "User found";
                // const userType = response.data;
                // localStorage.setItem("webID", sessionInfo.webId);
                // if (isUser) {
                //     localStorage.setItem("isLoggedIn", "true");
                //     localStorage.setItem("userType", userType);
                // }
                // else {
                //     localStorage.setItem("isLoggedIn", "false");
                //     localStorage.setItem("userType", "undefined");
                // }
                // console.log("Logged in as " + sessionInfo.webId);
                // this.route.navigate(['/home']);
            }
        }
    }

    async redirectToMemberSignUp() {
        this.route.navigate(['/memberSignup']);
    }

    async redirectToThirdPartySignUp() {
        this.route.navigate(['/thirdPartySignUp']);
    }
}