import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/userservice.service';

@Component({
    selector: 'app-callback',
    template: '<p>Loading...</p>',
})
export class CallbackComponent implements OnInit {
    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const isLoggedIn = params["isLoggedIn"]; // Assuming your server returns the sessionId in the callback URL
            if (isLoggedIn) {
                const webID = params["webId"];
                this.userService.checkUser(webID).subscribe(
                    (response) => {
                        const isUser = response.message === "User found.";
                        const userType = response.data;
                        localStorage.setItem("webID", webID);
                        if (isUser) {
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("userType", userType);
                        } else {
                            localStorage.setItem("isLoggedIn", "false");
                            localStorage.setItem("userType", "undefined");
                        }
                        console.log("Logged in as " + webID);
                        this.router.navigate(['/home']);
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            }
        });
    }
}
