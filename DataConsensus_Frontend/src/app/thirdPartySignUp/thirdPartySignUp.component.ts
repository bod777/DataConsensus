import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/userservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
    selector: 'third-party-sign-up',
    templateUrl: './thirdPartySignUp.component.html',
    styleUrls: ['./thirdPartySignUp.component.css']
})

export class ThirdPartySignUpComponent implements OnInit {

    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

    loginInput?: string = "https://login.inrupt.com";
    webID: string = "";
    name: string = "";
    email: string = "";
    organisationType: string = "";
    description: string = "";

    navigateToHomePage() {
        this.router.navigateByUrl('/');
    }

    submitForm() {
        localStorage.setItem('name', this.name);
        localStorage.setItem('email', this.email);
        localStorage.setItem('organisationType', this.organisationType);
        localStorage.setItem('description', this.description);

        window.location.href = "http://localhost:3000/thirdPartySignUp";
    }

    ngOnInit() {
        this.name = localStorage.getItem('name') || "";
        this.email = localStorage.getItem('email') || "";
        this.organisationType = localStorage.getItem('organisationType') || "";
        this.description = localStorage.getItem('description') || "";
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('organisationType');
        localStorage.removeItem('description');
        console.log("Signing Up");
        this.route.queryParams.subscribe((params) => {
            const isLoggedIn = params["isLoggedIn"];
            const sessionID = params["sessionId"];
            if (isLoggedIn) {
                this.webID = params["webId"];
                if (this.name && this.email && this.organisationType && this.description && this.webID) {
                    this.userService.registerThirdParty(this.webID, this.name, this.email, this.organisationType, this.description, sessionID).subscribe(
                        (response) => {
                            console.log(response);
                            localStorage.setItem("webID", this.webID);
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("userType", "THIRDPARTY");
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