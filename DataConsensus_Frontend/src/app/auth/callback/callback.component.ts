import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-callback',
    templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit {
    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const isLoggedIn = params["isLoggedIn"]; // Assuming your server returns the sessionId in the callback URL
            const sessionID = params["sessionId"];
            if (isLoggedIn) {
                const webID = params["webId"];
                this.userService.checkUser(webID).subscribe(
                    (response) => {
                        const isUser = response.message === "User found.";
                        const userType = response.data;
                        localStorage.setItem("webID", webID);
                        localStorage.setItem("sessionID", sessionID);
                        if (isUser) {
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("userType", userType);
                        } else {
                            localStorage.setItem("isLoggedIn", "false");
                            localStorage.setItem("userType", "undefined");
                        }
                        console.log("Logged in as " + webID);
                        this.router.navigate(['/']);
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            }
        });
    }
}
