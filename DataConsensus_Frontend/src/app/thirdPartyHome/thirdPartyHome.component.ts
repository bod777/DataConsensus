import { Component, OnInit } from '@angular/core';
import { login, getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'third-party-home',
    templateUrl: './thirdPartyHome.component.html',
    styleUrls: ['./thirdPartyHome.component.css']
})

export class ThirdPartyHomeComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
}