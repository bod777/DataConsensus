import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'profile',
    template: `
        <ng-container *ngIf="userType === 'MEMBER'">
            <member-profile></member-profile>
        </ng-container>
        <ng-container *ngIf="userType === 'THIRDPARTY'">
            <thirdparty-profile></thirdparty-profile>
        </ng-container>
        <ng-container *ngIf="userType === 'ADMIN'">
            <admin-profile></admin-profile>
        </ng-container>
    `
})

export class ProfileComponent implements OnInit {

    constructor(private router: Router) { }

    userType: string | null = "undefined";

    async ngOnInit() {
        this.userType = localStorage.getItem('userType');
        console.log("User type: " + this.userType)
    }
}