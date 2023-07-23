import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'member-home',
    templateUrl: './memberHome.component.html',
    styleUrls: ['./memberHome.component.css']
})

export class MemberHomeComponent implements OnInit {

    constructor(private userService: UserService, private _snackBar: MatSnackBar) { }

    ngOnInit() {
    }
}