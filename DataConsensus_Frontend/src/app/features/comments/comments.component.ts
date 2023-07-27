import { Component, Input, OnInit } from '@angular/core';
import { Comment } from "../../model/comment.interface";
import { CommentService } from "../../services/comment.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css'],
})
export class CommentSectionComponent implements OnInit {
    @Input() policyURL: string = '';
    newComment: string = '';
    comments: Comment[] = [];
    user: string = localStorage.getItem("webID") || "";
    userType: string = localStorage.getItem("userType") || "MEMBER";
    isAdmin: boolean = this.userType === "ADMIN";

    constructor(private commentService: CommentService, private _snackBar: MatSnackBar) { }

    addComment() {
        if (this.newComment.trim() !== '') {
            const newComment: Comment = {
                id: '', // You can generate a unique ID using a library like uuid or a backend API.
                timeCreated: new Date().toISOString(),
                policyID: '',
                author: '', // Replace this with the authenticated user's ID or username.
                content: this.newComment,
                moderated: 'false',
            };
            this.comments.push(newComment);
            this.newComment = '';
        }
    }

    deleteComment(comment: Comment) {
        const index = this.comments.indexOf(comment);
        if (index >= 0) {
            this.comments.splice(index, 1);
        }
    }

    moderateComment(comment: Comment) {
        comment.moderated = 'true';
        comment.timeModerated = new Date().toISOString();
    }

    ngOnInit() {
        this.commentService.getComments(this.policyURL).subscribe(
            (comments: any) => {
                const relevantComments = comments.data;
                const processedComments = relevantComments.map((comment: Comment) => {
                    const datetimeCreated = new Date(comment.timeCreated);
                    const booleanModerated = comment.moderated === 'true';
                    return {
                        ...comment,
                        datetimeCreated,
                        booleanModerated,
                    };
                });
                processedComments.sort((a: any, b: any) => {
                    return a.datetimeCreated.getDate() - b.datetimeCreated.getDate();
                });
                this.comments = processedComments;
            },
            (error: any) => {
                this._snackBar.open("Error retrieving comments: " + error, "Close", { duration: 3000 });
            }
        );
    }
}
