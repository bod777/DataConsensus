import { Component, OnInit } from '@angular/core';
import { login, getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'member-home',
    templateUrl: './memberHome.component.html',
    styleUrls: ['./memberHome.component.css']
})

export class MemberHomeComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
}