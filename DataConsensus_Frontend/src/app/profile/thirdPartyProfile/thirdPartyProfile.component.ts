import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'thirdParty-profile',
    templateUrl: './thirdPartyProfile.component.html',
    styleUrls: ['./thirdPartyProfile.component.css']
})

export class ThirdPartyProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar) { }

    webID: string = localStorage.getItem("webID") || "";
    name: string = "";
    email: string = "";
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

    }

    ngOnInit() {
        this.userService.getThirdParty(this.webID).subscribe(
            (profile) => {
                console.log(profile);
                this.webID = profile.data.webID;
                this.name = profile.data.name;
                this.email = profile.data.email;
                this.organisationType = profile.data.orgType;
                this.description = profile.data.description;
                console.log(this.organisationType);
            },
            (error) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close", { duration: 3000 });
            }
        );
    }
}