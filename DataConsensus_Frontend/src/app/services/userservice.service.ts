import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { User } from '../model/user-info';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DataAccessRequest } from '../model/data-access-request';
import { SolidDataset, getSolidDataset, getThing, ThingPersisted } from '@inrupt/solid-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private REST_API_SERVICE = "http://localhost:3000/api/v1/";

    session = new Session();

    constructor(private http: HttpClient) { }

    login(): Observable<any> {
        return this.http.get('http://localhost:3000/login');
    }

    checkUser(webID: string): Observable<any> {

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('webID', webID);
        return this.http.get('http://localhost:3000/api/v1/user/checkUser', { headers, params });
        // this.http.get('http://localhost:3000/api/v1/user/checkUser', { headers, params })
        //     .subscribe(
        //         (response) => {
        //             console.log("Test", JSON.stringify(response));
        //             return response;
        //         },
        //         (error) => {
        //             console.log(error);
        //         }
        //     );

    }

    getResource(sessionId: string) {
        console.log("getting resource")
        const resourceUrl = 'https://storage.inrupt.com/92faa4f2-4dc2-4645-a5fe-9f0f8d47a675/Sample%20Data.csv'; // Replace with the actual resource URL you want to fetch.
        const headers = new HttpHeaders().set('Authorization', `Bearer ${sessionId}`);

        return this.http.get('http://localhost:3000/fetch-user-resource', { headers, params: { resource: resourceUrl } });
        // return this.http.get('http://localhost:3000/fetch-user-resource', { params: { resource: resourceUrl } })
    }

    registerMember(webID: string, name: string, email: string, dataSource: string): Observable<any> {
        console.log("registering Member");
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post('http://localhost:3000/api/v1/user/registerMember', { webID, name, email, dataSource }, { headers });
    }

    registerThirdParty(user: User): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post('http://localhost:3000/api/v1/user/registerThirdParty', user, { headers });
    }

}

