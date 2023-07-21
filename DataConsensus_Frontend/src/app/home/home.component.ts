import { Component, OnInit } from '@angular/core';
import { login, getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  template: `
      <ng-container *ngIf="userType === 'MEMBER'">
        <member-home></member-home>
      </ng-container>
      <ng-container *ngIf="userType === 'ADMIN'">
        <member-home></member-home>
      </ng-container>
    `
})

export class HomeComponent implements OnInit {
  userType: string | null = "undefined";

  async ngOnInit() {
    this.userType = localStorage.getItem('userType');
    console.log("User type: " + this.userType)
  }
}