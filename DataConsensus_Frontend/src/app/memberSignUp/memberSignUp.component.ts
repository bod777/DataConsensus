import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { login, getDefaultSession, handleIncomingRedirect, fetch } from "@inrupt/solid-client-authn-browser";
import { MatSnackBar } from '@angular/material/snack-bar';
import { getFile, isRawData, getContentType, getSourceUrl, } from "@inrupt/solid-client";
import { UserService } from '../services/userservice.service';

@Component({
    selector: 'member-sign-up',
    templateUrl: './memberSignUp.component.html',
    styleUrls: ['./memberSignUp.component.css']
})

export class MemberSignUpComponent implements OnInit {

    constructor(private route: Router, private userService: UserService) { }

    loginInput?: string = "https://login.inrupt.com";
    webID: string = "";
    name: string = "";
    email: string = "";
    dataSource: string = "";

    async submitForm() {
        localStorage.setItem('name', this.name);
        localStorage.setItem('email', this.email);
        localStorage.setItem('dataSource', this.dataSource);

        return login({
            oidcIssuer: this.loginInput,
            redirectUrl: window.location.href,
            clientName: "Testing"
        });
    }

    async addData(sessionId: string) {
        // try {
        //     const file = await getFile(
        //         dataSource,               // File in Pod to Read
        //         { fetch: fetch }       // fetch from authenticated session
        //     );

        // } catch (err) {
        //     console.log(err);
        // }
        console.log("addData");
        await this.userService.getResource(sessionId).subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    async ngOnInit() {
        let sessionInfo: any;
        sessionInfo = await handleIncomingRedirect({ restorePreviousSession: true });

        console.log(JSON.stringify(sessionInfo))

        // Retrieve the form field values from localStorage
        this.name = localStorage.getItem('name') || "";
        this.email = localStorage.getItem('email') || "";
        this.dataSource = localStorage.getItem('dataSource') || "";

        // Clear the form field values from localStorage
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('dataSource');
        this.webID = sessionInfo.webId;
        this.addData(sessionInfo.id);
        // if (this.name && this.email && this.dataSource && this.webID) {

        // this.userService.registerMember(this.webID, this.name, this.email, this.dataSource).subscribe(
        //     (response) => {
        //         console.log(response);
        //         this.addData(this.dataSource);
        //         localStorage.setItem("webID", this.webID);
        //         localStorage.setItem("isLoggedIn", "true");
        //         localStorage.setItem("userType", "MEMBER");
        //         this.route.navigate(['/home']);
        //     },
        //     (error) => {
        //         console.log(error);
        //     }
        // );
        // }
    }
}