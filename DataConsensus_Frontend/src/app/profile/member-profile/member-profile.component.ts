import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'member-profile',
    templateUrl: './member-profile.component.html',
    styleUrls: ['./member-profile.component.css']
})

export class MemberProfileComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router) { }

    broken: boolean = false;
    loading: boolean = true;
    sessionID: string = localStorage.getItem("sessionId") || "";
    loginInput: string = localStorage.getItem("loginInput") || "https://login.inrupt.com";
    user: string = localStorage.getItem("webID") || "";
    currentUserType: string = localStorage.getItem("userType") || "";
    webID: string = "";
    name: string = "";
    email: string = "";
    issued: Date = new Date();
    dataSource: string = "";

    saveChanges() {
        this.userService.updateMember(this.webID, this.name, this.email).subscribe(
            (profile) => {
                this._snackBar.open("Profile updated successfully", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error updating profile: " + error, "Close");
            }
        );
    }

    refreshSession() {
        localStorage.setItem('dataSource', this.dataSource);
        window.location.href = "http://localhost:3000/api/v1/auth/refresh-session?issuer=" + this.loginInput;
    }

    updateData() {
        this.dataSource = localStorage.getItem('dataSource') || "";
        this.userService.updateDatasource(this.webID, this.dataSource, this.sessionID).subscribe(
            (profile) => {
                this._snackBar.open("Data updated successfully", "Close", { duration: 3000 });
            },
            (error) => {
                if (error.error.message === "You do not have permission to access this file. Please double check the datasource URL.") {
                    console.log(error);
                    this._snackBar.open(error.error.message, "Close");
                } else {
                    console.log(error);
                    this._snackBar.open("Error adding data", "Close");
                }
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
                this._snackBar.open("Error deleting data: " + error, "Close");
            }
        )
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.webID = params["webID"];
            if (params["sessionId"] !== undefined) {
                this.sessionID = params["sessionId"];
                localStorage.setItem("sessionId", this.sessionID);
                this.updateData();
            }
        });
        this.userService.getMember(this.webID).subscribe(
            (profile) => {
                this.webID = profile.data.webID;
                this.name = profile.data.name;
                this.email = profile.data.email;
                this.issued = new Date(profile.data.issued);
                this.dataSource = profile.data.dataSource;
                console.log(profile.data);
            },
            (error) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close");
                this.broken = true;
            }
        );
        this.loading = false;
    }
}