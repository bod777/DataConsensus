import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private http: HttpClient) { }

  upvote(voter: string, policyURL: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post('http://localhost:3000/api/v1/vote/upvote', { voter, policyURL }, { headers });
  }

  downvote(voter: string, policyURL: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post('http://localhost:3000/api/v1/vote/downvote', { voter, policyURL }, { headers });
  }

  getVote(voter: string, policyID: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams().set('voter', voter).set('policyID', policyID);
    return this.http.get('http://localhost:3000/api/v1/vote/get-request-vote', { headers, params });
  }

  submitPreference(req: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post('http://localhost:3000/api/v1/vote/add-preference', req, { headers });
  }

  getPreference(voter: string, projectID: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams().set('voter', voter).set('projectID', projectID);
    return this.http.get('http://localhost:3000/api/v1/vote/get-offer-vote', { headers, params });
  }
}
