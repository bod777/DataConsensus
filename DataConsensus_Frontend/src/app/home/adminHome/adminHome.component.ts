import { Component, OnInit } from '@angular/core';
import { login, getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'admin-home',
    templateUrl: './adminHome.component.html',
    styleUrls: ['./adminHome.component.css']
})

export class AdminHomeComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
}