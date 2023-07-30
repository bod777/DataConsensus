import { Component, Input, OnInit } from '@angular/core';
import { Comment } from "../../model/comment.interface";
import { CommentService } from "../../services/comment.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'constraints',
    templateUrl: './constraints.component.html',
    styleUrls: ['./constraints.component.css'],
})
export class ConstraintsComponent {
    @Input() policy: any = {};
}