import { Injectable } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
        return this.http.get('http://localhost:3000/api/v1/user/check-user', { headers, params });
    }

    registerMember(webID: string, name: string, email: string, dataSource: string, sessionID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post('http://localhost:3000/api/v1/user/register-member', { webID, name, email, dataSource, sessionID }, { headers });
    }

    registerThirdParty(webID: string, name: string, email: string, organisationType: string, description: string, sessionID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post('http://localhost:3000/api/v1/user/register-thirdparty', { webID, name, email, org: organisationType, description }, { headers });
    }

    getMember(webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('webID', webID);
        return this.http.get('http://localhost:3000/api/v1/user/member', { headers, params });
    }

    updateMember(webID: string, name: string, email: string, dataSource: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/user/updateMember', { webID, name, email, dataSource }, { headers });
    }

    getThirdParty(webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('webID', webID);
        return this.http.get('http://localhost:3000/api/v1/user/thirdparty', { headers, params });
    }

    updateThirdParty(webID: string, name: string, email: string, organisationType: string, description: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/user/update-thirdparty', { webID, name, email, orgType: organisationType, description }, { headers });
    }

    getAdmin(webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('webID', webID);
        return this.http.get('http://localhost:3000/api/v1/user/admin', { headers, params });
    }

    updateAdmin(webID: string, name: string, email: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/user/update-admin', { webID, name, email }, { headers });
    }

    removeData(webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('webID', webID);
        return this.http.delete('http://localhost:3000/api/v1/user/remove-data', { headers, params });
    }

    getMemberCount(date: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('date', date);
        return this.http.get('http://localhost:3000/api/v1/user/get-member-count', { headers, params });
    }

    removeAccess(webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('webID', webID);
        return this.http.get('http://localhost:3000/api/v1/remove-access', { headers, params });
    }
}

