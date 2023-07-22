import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    template: `
        <div><menu></menu></div>
        <ng-container *ngIf="userType === 'MEMBER'">
            <member-home></member-home>
        </ng-container>
        <ng-container *ngIf="userType === 'ADMIN'">
            <member-home></member-home>
        </ng-container>
    `
})

export class HomeComponent implements OnInit {

    constructor(private router: Router) { }

    userType: string | null = "undefined";

    async ngOnInit() {
        this.userType = localStorage.getItem('userType');
        console.log("User type: " + this.userType)
    }
}