import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Session } from "@inrupt/solid-client-authn-browser";
import { AuthserviceService } from '../authservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    getSolidDataset,
    getThing,
    setThing,
    getStringNoLocale,
    setStringNoLocale,
    saveSolidDatasetAt
} from "@inrupt/solid-client";
import { Observable, windowWhen } from 'rxjs';
import { FormControl } from '@angular/forms';
import { User } from '../model/user-info';
import { AjaxResult } from '../model/constants';

@Component({
    selector: 'app-login', // This is the CSS selector that Angular uses to identify this component in a template.
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
    //    export class LoginComponent implements OnInit, OnDestroy { ... }: This is the LoginComponent class being defined. It implements OnInit and OnDestroy, which are lifecycle hooks in Angular. OnInit is called after Angular has initialized all data-bound properties of a directive, and OnDestroy is called just before Angular destroys the directive.

    constructor(private route: Router, private service: AuthserviceService, private _snackBar: MatSnackBar) {
    } // This is the constructor of the LoginComponent class. It injects three services: Router, AuthserviceService, and MatSnackBar (to display information or text from bottom of the screen when performing any action ).

    // Adding properties of the LoginComponent class.
    SOLID_IDENTITY_PROVIDER?: string = "https://login.inrupt.com"; // URL of the Solid identity provider
    USER_SELECTION: string = "USER";
    session = new Session();
    validate: boolean = false;

    // It sets some values in local storage and then calls the login method of the session with some options.
    async login(): Promise<void> {
        console.log("inside login")
        console.log(this.session.info.sessionId);
        localStorage.setItem("signup", "false");
        localStorage.setItem("signupUser", this.USER_SELECTION);
        await this.session.login({
            oidcIssuer: this.SOLID_IDENTITY_PROVIDER,
            clientName: "DataConsensus",
            redirectUrl: window.location.href
        });
    }

    async signUP(): Promise<void> {
        localStorage.setItem("signup", "true");
        localStorage.setItem("signupUser", this.USER_SELECTION);
        await this.session.login({
            oidcIssuer: this.SOLID_IDENTITY_PROVIDER,
            clientName: "DataConsensus",
            redirectUrl: window.location.href
        });
    }

    // This is the ngOnInit method. It handles the incoming redirect from the Solid identity provider after login, checks if the user is logged in, and then either registers the user or checks the user based on whether the user is signing up or logging in.
    async ngOnInit(): Promise<void> {

        //handle incoming redirect from solid identity provider after login
        await this.session.handleIncomingRedirect({ url: window.location.href });

        let webId = this.session.info.webId ? this.session.info.webId : "";
        let userSelection = localStorage.getItem("signupUser");
        let routerparam = userSelection == "USER" ? "/userDashboard" :
            (userSelection == "ADMIN") ? "/adminDashboard" : "/companyDashboard";

        if (this.session.info.isLoggedIn) {
            let myAppProfile = await getSolidDataset(this.session.info.webId + "/user");
            let userCard = getThing(
                myAppProfile,
                this.session.info.webId ? this.session.info.webId : "" //will always have some value
            );
            let name = getThing(
                myAppProfile,
                this.session.info.webId ? this.session.info.webId : "" //will always have some value
            );
            let userLogged: User = new User(webId, userSelection ? userSelection : "USER");
            //signup logic
            if (localStorage.getItem("signup") == "true") {
                // resetting back local storage
                localStorage.setItem("signup", "false");
                (await this.service.registerUser(userLogged)).subscribe((result: AjaxResult) => {
                    console.log("after registration");

                    if (result['message'] == "user Registered") {
                        this.service.userLoggedIn = userLogged;
                        this.route.navigate([routerparam]);
                    }
                    else {
                        this._snackBar.open("user exists already Try logging in", "ok");
                        console.log("user exists already cannot register");
                    }
                });
            }
            else {// login logic
                (await this.service.checkUser(userLogged)).subscribe((result: AjaxResult) => {
                    if (result['message'] == "login success") {
                        this.service.userLoggedIn = userLogged;
                        this.route.navigate([routerparam]);
                    }
                    else {
                        this._snackBar.open("user not found, Try signing in", "ok");
                    }
                });
                // resetting back local storage
                localStorage.setItem("signup", "false");
            }
        }
    }

    ngOnDestroy(): void {
        this.service.session = this.session; // sets the session property of the service to the current session.
    }

}