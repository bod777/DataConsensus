import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'admin-profile',
    templateUrl: './admin-profile.component.html',
    styleUrls: ['./admin-profile.component.css']
})

export class AdminProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar, private route: ActivatedRoute) { }

    user: string = localStorage.getItem("webID") || "";
    webID: string = "";
    name: string = "";
    email: string = "";

    saveChanges() {
        this.userService.updateAdmin(this.webID, this.name, this.email).subscribe(
            (profile) => {
                this._snackBar.open("Profile updated successfully", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error updating profile: " + error, "Close", { duration: 3000 });
            }
        );
    }

    cancelChanges() {

    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.webID = params["webID"];
        });
        this.userService.getAdmin(this.webID).subscribe(
            (profile) => {
                this.webID = profile.data.webID;
                this.name = profile.data.name;
                this.email = profile.data.email;
            },
            (error) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close", { duration: 3000 });
            }
        );
    }
}