import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'admin-profile',
    templateUrl: './adminProfile.component.html',
    styleUrls: ['./adminProfile.component.css']
})

export class AdminProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar) { }

    webID: string = localStorage.getItem("webID") || "";
    name: string = "";
    email: string = "";
    dataSource: string = "";

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