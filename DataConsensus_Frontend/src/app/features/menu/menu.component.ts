import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent {

    constructor(private router: Router) { }

    userType: string = localStorage.getItem('userType') || "";

    navigateToHomePage() {
        this.router.navigateByUrl('/home');
    }
    navigateToAgreementsPage() {
        this.router.navigateByUrl('/agreements');
    }
    navigateToProfilePage() {
        this.router.navigateByUrl('/profile');
    }
    navigateToSubmitRequest() {
        this.router.navigateByUrl('/submit-request');
    }

    logout() {
        localStorage.removeItem('webID');
        localStorage.removeItem('userType');
        localStorage.setItem('loggedIn', 'false');
        this.router.navigateByUrl('/login');
    }
}
