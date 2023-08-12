import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'member-signup',
    templateUrl: './member-signup.component.html',
    styleUrls: ['./member-signup.component.css']
})

export class MemberSignUpComponent implements OnInit {

    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private _snackBar: MatSnackBar) { }

    showProgressBar: boolean = false;
    progress: number = 0;
    loginInput: string = "https://login.inrupt.com";
    webID: string = "";
    name: string = "";
    email: string = "";
    dataSource: string = "";

    navigateToHomePage() {
        this.router.navigateByUrl('/login');
    }

    async submitForm() {
        localStorage.setItem('name', this.name);
        localStorage.setItem('email', this.email);
        localStorage.setItem('dataSource', this.dataSource);
        localStorage.setItem('loginInput', this.loginInput);
        // window.location.href = "http://localhost:3000/api/v1/auth/member-signup";
        window.location.href = "http://localhost:3000/api/v1/auth/member-signup?issuer=" + this.loginInput;
    }

    async ngOnInit() {
        this.name = localStorage.getItem('name') || "";
        this.email = localStorage.getItem('email') || "";
        this.dataSource = localStorage.getItem('dataSource') || "";
        console.log(this.name, this.email, this.dataSource);
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('dataSource');
        console.log("Signing Up");
        this.route.queryParams.subscribe((params) => {
            const isLoggedIn = params["isLoggedIn"] === "true" ? true : false;
            const sessionID = params["sessionId"];
            console.log(params);
            if (isLoggedIn) {
                this.webID = params["webId"];
                this.showProgressBar = true;
                const interval$ = interval(500);
                const subscription = interval$.subscribe(() => {
                    this.progress += 10;
                    if (this.progress >= 100) {
                        this.showProgressBar = false;
                        subscription.unsubscribe();
                        this.progress = 0;
                    }
                });
                if (this.name && this.email && this.dataSource && this.webID) {
                    this.userService.registerMember(this.webID, this.name, this.email, this.dataSource, sessionID).subscribe(
                        (response) => {
                            console.log(response);
                            localStorage.setItem("webID", this.webID);
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("userType", "MEMBER");
                            this.router.navigate(['/']);
                        },
                        (error) => {
                            if (error.error.message === "User is already registered as a member.") {
                                this._snackBar.open("User already exists. Please login.", "Close");
                                this.router.navigate(['/login']);
                            } else if (error.error.message === "You do not have permission to access this file. Please double check the datasource URL.") {
                                console.log(error);
                                this._snackBar.open(error.error.message, "Close");
                            } else {
                                console.log(error);
                                this._snackBar.open("Error registering new member", "Close");
                            }
                        }
                    );
                }
            }
        });
    }
}