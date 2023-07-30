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
        this.commentService.addComment(this.policyURL, this.user, this.newComment).subscribe(
            (response: any) => {
                this.comments.push(response.data);
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error: any) => {
                this._snackBar.open("Error retrieving comments: " + error, "Close", { duration: 3000 });
            }
        );
    }

    deleteComment(comment: Comment) {
        if (this.user === comment.author) {
            this.commentService.deleteComment(comment).subscribe(
                (response: any) => {
                    console.log(response);
                    this.comments = this.comments.filter((obj) => obj.commentID !== comment.commentID);
                    this._snackBar.open("Success", "Close", { duration: 3000 });
                },
                (error: any) => {
                    this._snackBar.open("Error deleting comment: " + error, "Close", { duration: 3000 });
                }
            );
        }
    }

    moderateComment(comment: Comment) {
        if (this.userType === "ADMIN") {
            this.commentService.moderate(comment.commentID, this.user).subscribe(
                (response: any) => {
                    console.log(response);
                    this.comments = this.comments.filter((obj) => obj.commentID !== comment.commentID);
                    this._snackBar.open("Success", "Close", { duration: 3000 });
                },
                (error: any) => {
                    this._snackBar.open("Error retrieving comments: " + error, "Close", { duration: 3000 });
                }
            );
        }
    }

    ngOnInit() {
        this.commentService.getComments(this.policyURL).subscribe(
            (comments: any) => {
                // console.log(commentsdata);
                comments.data.forEach((comment: Comment) => {
                    comment.timeCreated = new Date(comment.timeCreated);
                    comment.timeModerated = new Date(comment.timeModerated);
                });
                let relevantComments = comments.data;
                relevantComments = relevantComments.filter((comment: Comment) => {
                    return comment.moderated !== true;
                });
                relevantComments.sort((a: any, b: any) => {
                    return a.timeCreated.getDate() - b.timeCreated.getDate();
                });
                this.comments = relevantComments;
            },
            (error: any) => {
                this._snackBar.open("Error retrieving comments: " + error, "Close", { duration: 3000 });
            }
        );
    }
}
