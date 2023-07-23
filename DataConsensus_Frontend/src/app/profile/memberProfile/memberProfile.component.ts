import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'member-profile',
    templateUrl: './memberProfile.component.html',
    styleUrls: ['./memberProfile.component.css']
})

export class MemberProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar) { }

    webID: string = localStorage.getItem("webID") || "";
    name: string = "";
    email: string = "";
    dataSource: string = "";

    saveChanges() {
        this.userService.updateMember(this.webID, this.name, this.email, this.dataSource).subscribe(
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
        this.userService.getMember(this.webID).subscribe(
            (profile) => {
                this.webID = profile.data.webID;
                this.name = profile.data.name;
                this.email = profile.data.email;
                this.dataSource = profile.data.dataSource;
            },
            (error) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close", { duration: 3000 });
            }
        );
    }
}