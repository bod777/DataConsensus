import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit {

  constructor(private router: Router) { }

  userType: string | null = "undefined";

  async ngOnInit() {
    this.userType = localStorage.getItem('userType');
    console.log("User type: " + this.userType)
  }
}
