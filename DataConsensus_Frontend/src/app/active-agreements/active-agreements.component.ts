import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
    selector: 'active-agreements',
    templateUrl: './active-agreements.component.html',
    styleUrls: ['./active-agreements.component.css']
})
export class ActiveAgreementsComponent implements OnInit {

    constructor(private router: Router) { }

    userType: string | null = "undefined";

    async ngOnInit() {
        this.userType = localStorage.getItem('userType');
        console.log("User type: " + this.userType)
    }
}
