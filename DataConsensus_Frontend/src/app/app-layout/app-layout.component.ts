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

  userType: string = localStorage.getItem('userType') || '';
  isLoggedIn: boolean = localStorage.getItem('isLoggedIn') === 'true' || false;

  async ngOnInit() {
    console.log("isLoggedIn: " + this.isLoggedIn);
    console.log("userType: " + this.userType);
    if (this.isLoggedIn === false) {
      this.router.navigate(['/login']);
    }
  }
}
