import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'member-profile',
    templateUrl: './member-profile.component.html',
    styleUrls: ['./member-profile.component.css']
})

export class MemberProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar, private router: Router) { }

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
        this.ngOnInit();
        window.location.reload();
    }

    deleteUser() {
        this.userService.removeData(this.webID).subscribe(
            (profile) => {
                this._snackBar.open("User data deleted", "Close", { duration: 3000 });
                localStorage.removeItem('webID');
                localStorage.removeItem('userType');
                localStorage.setItem('loggedIn', 'false');
                this.router.navigateByUrl('/login');
            },
            (error) => {
                this._snackBar.open("Error deleting data: " + error, "Close", { duration: 3000 });
            }
        )
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