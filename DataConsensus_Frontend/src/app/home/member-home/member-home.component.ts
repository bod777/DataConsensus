import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'member-home',
    templateUrl: './member-home.component.html',
    styleUrls: ['./member-home.component.css']
})

export class MemberHomeComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar) { }

    ngOnInit() {
    }
}