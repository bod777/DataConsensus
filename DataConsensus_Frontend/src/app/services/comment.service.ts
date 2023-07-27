import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agreement } from '../model/agreement.interface';
import { Request } from '../model/request.interface';
import { Offer } from '../model/offer.interface';
import { Project } from '../model/project.interface';
import { Comment } from '../model/comment.interface';
import { DatePipe } from '@angular/common'

@Injectable({
    providedIn: 'root'
})
export class CommentService {

    private REST_API_SERVICE = "http://localhost:3000/api/v1/";

    constructor(private http: HttpClient, public datepipe: DatePipe) { }

    getComments(policyURL: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const parts = policyURL.split('#');
        const policyID = parts[1];
        const policyType = parts[0];
        const params = new HttpParams().set('policyID', policyID).set('policyType', policyType);
        return this.http.get<Comment[]>('http://localhost:3000/api/v1/comment/comments', { headers, params });
    }

    deleteComment(comment: Comment): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('commentID', comment.id);
        return this.http.delete('http://localhost:3000/api/v1/comment/remove-comment', { headers, params });
    }
}

