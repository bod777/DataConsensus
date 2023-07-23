import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'member-signup',
    templateUrl: './member-signup.component.html',
    styleUrls: ['./member-signup.component.css']
})

export class MemberSignUpComponent implements OnInit {

    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

    loginInput?: string = "https://login.inrupt.com";
    webID: string = "";
    name: string = "";
    email: string = "";
    dataSource: string = "";

    navigateToHomePage() {
        this.router.navigateByUrl('/');
    }

    async submitForm() {
        localStorage.setItem('name', this.name);
        localStorage.setItem('email', this.email);
        localStorage.setItem('dataSource', this.dataSource);

        window.location.href = "http://localhost:3000/api/v1/auth/memberSignUp";
    }

    async ngOnInit() {
        this.name = localStorage.getItem('name') || "";
        this.email = localStorage.getItem('email') || "";
        this.dataSource = localStorage.getItem('dataSource') || "";
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('dataSource');
        console.log("Signing Up");
        this.route.queryParams.subscribe((params) => {
            const isLoggedIn = params["isLoggedIn"];
            const sessionID = params["sessionId"];
            if (isLoggedIn) {
                this.webID = params["webId"];
                if (this.name && this.email && this.dataSource && this.webID) {
                    this.userService.registerMember(this.webID, this.name, this.email, this.dataSource, sessionID).subscribe(
                        (response) => {
                            console.log(response);
                            localStorage.setItem("webID", this.webID);
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("userType", "MEMBER");
                            this.router.navigate(['/home']);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                }
            }
        });
    }
}