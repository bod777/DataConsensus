import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'thirdparty-profile',
    templateUrl: './thirdparty-profile.component.html',
    styleUrls: ['./thirdparty-profile.component.css']
})

export class ThirdPartyProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar, private route: ActivatedRoute) { }

    user: string = localStorage.getItem("webID") || "";
    webID: string = "";
    name: string = "";
    email: string = "";
    issued: Date = new Date();
    organisationType: string = "";
    description: string = "";

    saveChanges() {
        this.userService.updateThirdParty(this.webID, this.name, this.email, this.organisationType, this.description).subscribe(
            (profile) => {
                this._snackBar.open("Profile updated successfully", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error updating profile: " + error, "Close", { duration: 3000 });
            }
        );
    }

    cancelChanges() {
        this.ngOnInit();
        window.location.reload();
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.webID = params["webID"];
        });
        this.userService.getThirdParty(this.webID).subscribe(
            (profile) => {
                console.log(profile);
                this.webID = profile.data.webID;
                this.name = profile.data.name;
                this.email = profile.data.email;
                this.issued = new Date(profile.data.issued);
                this.organisationType = profile.data.orgType;
                this.description = profile.data.description;
            },
            (error) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close", { duration: 3000 });
            }
        );
    }
}