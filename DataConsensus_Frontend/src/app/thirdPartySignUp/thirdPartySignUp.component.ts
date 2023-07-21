import { Component, OnInit } from '@angular/core';
import { login, getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
    selector: 'third-party-sign-up',
    templateUrl: './thirdPartySignUp.component.html',
    styleUrls: ['./thirdPartySignUp.component.css']
})

export class ThirdPartySignUpComponent implements OnInit {
    loginInput?: string = "https://login.inrupt.com";
    webID: string = "";
    name: string = "";
    email: string = "";
    organisationType: string = "";
    description: string = "";

    submitForm() {
        return login({
            oidcIssuer: this.loginInput,
            redirectUrl: window.location.href,
            clientName: "DataConsensus"
        });
    }

    ngOnInit() {
        let sessionInfo: any;
        sessionInfo = handleIncomingRedirect({ restorePreviousSession: true });
        console.log(JSON.stringify(sessionInfo))
    }
}