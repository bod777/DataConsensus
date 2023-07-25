import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    template: `
        <ng-container *ngIf="userType === 'MEMBER'">
            <member-home></member-home>
        </ng-container>
        <ng-container *ngIf="userType === 'THIRDPARTY'">
            <thirdparty-home></thirdparty-home>
        </ng-container>
        <ng-container *ngIf="userType === 'ADMIN'">
            <admin-home></admin-home>
        </ng-container>
    `
})

export class HomeComponent implements OnInit {

    constructor(private router: Router) { }

    userType: string = localStorage.getItem('userType') || "";

    async ngOnInit() {
        console.log("User type: " + this.userType)
    }
}