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

    loading: boolean = true;
    broken: boolean = false;
    user: string = localStorage.getItem("webID") || "";
    webID: string = "";
    name: string = "";
    email: string = "";
    issued: Date = new Date();

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
        this.ngOnInit();
        window.location.reload();
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
                this.issued = new Date(profile.data.issued);
            },
            (error) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close", { duration: 3000 });
                this.broken = true;
            }
        );
        this.loading = false;
    }
}