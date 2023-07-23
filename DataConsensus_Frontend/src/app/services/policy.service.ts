import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PolicyService {

    private REST_API_SERVICE = "http://localhost:3000/api/v1/";

    constructor(private http: HttpClient) { }

    login(): Observable<any> {
        return this.http.get('http://localhost:3000/login');
    }

    getAgreement(policyURL: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('policyID', policyURL);
        return this.http.get('http://localhost:3000/api/v1/policy/getAgreement', { headers, params });
    }

    getRequest(policyURL: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('policyURL', policyURL);
        return this.http.get('http://localhost:3000/api/v1/policy/getRequest', { headers, params });
    }

    getOffer(policyURL: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('policyURL', policyURL);
        return this.http.get('http://localhost:3000/api/v1/policy/getOffer', { headers, params });
    }
}

