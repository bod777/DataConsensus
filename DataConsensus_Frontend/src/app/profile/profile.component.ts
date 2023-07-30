import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';

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
        <ng-container *ngIf="userType === 'undefined'">
            <p>Invalid user</p>
        </ng-container>
    `
})

export class ProfileComponent implements OnInit {

    constructor(private router: Router, private userService: UserService, private route: ActivatedRoute) { }

    userType: string | null = "undefined";
    webID: string = "";

    async ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.webID = params["webID"];
        });
        this.userService.checkUser(this.webID).subscribe(
            (response: any) => {
                const isUser = response.message === "User found.";
                this.userType = response.data;
            },
            (error: any) => {
                console.log(error);
            }
        );
    }
}