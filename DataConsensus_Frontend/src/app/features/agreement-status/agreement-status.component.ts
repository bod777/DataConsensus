import { Component, Input, OnInit } from '@angular/core';
import { Comment } from "../../model/comment.interface";
import { CommentService } from "../../services/comment.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'agreement-status',
    templateUrl: './agreement-status.component.html',
    styleUrls: ['./agreement-status.component.css'],
})
export class AgreementStatusComponent {
    @Input() isActiveAgreement: boolean = false;
    @Input() hasAgreement: boolean = false;
}