import { Component, Input, OnInit } from '@angular/core';

interface Comment {
    id: string;
    timeCreated: string;
    policyID: string;
    author: string;
    content: string;
    timeModerated?: string;
    moderated?: string;
}

@Component({
    selector: 'comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css'],
})
export class CommentSectionComponent implements OnInit {
    @Input() comments: Comment[] = [];
    @Input() isAdmin: boolean = false;
    newComment: string = '';

    constructor() { }

    ngOnInit(): void { }

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
}
