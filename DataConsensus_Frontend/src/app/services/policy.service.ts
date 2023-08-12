import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agreement } from '../model/agreement.interface';
import { Request } from '../model/request.interface';
import { Offer } from '../model/offer.interface';
import { Project } from '../model/project.interface';
import { DatePipe } from '@angular/common'

@Injectable({
    providedIn: 'root'
})
export class PolicyService {

    private REST_API_SERVICE = "http://localhost:3000/api/v1/";

    constructor(private http: HttpClient, public datepipe: DatePipe) { }

    getAgreement(agreementID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('policyID', agreementID);
        return this.http.get('http://localhost:3000/api/v1/policy/agreement', { headers, params });
    }

    getRequest(requestID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('policyID', requestID);
        return this.http.get('http://localhost:3000/api/v1/policy/request', { headers, params });
    }

    getOffer(offerID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('policyID', offerID);
        return this.http.get('http://localhost:3000/api/v1/policy/offer', { headers, params });
    }

    getAllRequests(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.get<{ data: Request[] }>('http://localhost:3000/api/v1/policy/all-requests', { headers });
    }

    getAllOffers(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.get<{ data: Offer[] }>('http://localhost:3000/api/v1/policy/all-offers', { headers });
    }

    getAllAgreements(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.get<{ data: Agreement[] }>('http://localhost:3000/api/v1/policy/all-agreements', { headers });
    }

    getAllProjects(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.get<{ data: Project[] }>('http://localhost:3000/api/v1/project/all-projects', { headers });
    }

    submitRequest(webID: string, title: string, description: string, justification: string, consequences: string, organisationType: string, purpose: string, sellingData: boolean, sellingInsights: boolean, techOrgMeasures: string[], recipients: string[], recipientJustification: string, duration: number, durationJustification: string, jurisdiction: string, thirdCountries: string[], thirdCountriesJustification: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const request = {
            "title": title,
            "description": description,
            "user": webID,
            "hasJustification": justification,
            "hasConsequence": consequences,
            "organisation": organisationType,
            "purpose": purpose,
            "sellingData": sellingData,
            "sellingInsights": sellingInsights,
            "measures": techOrgMeasures,
            "recipients": recipients,
            "recipientsJustification": recipientJustification,
            "untilTimeDuration": duration,
            "durationJustification": durationJustification,
            "juridiction": jurisdiction,
            "thirdCountry": thirdCountries,
            "thirdCountryJustification": thirdCountriesJustification
        }
        return this.http.post('http://localhost:3000/api/v1/policy/submit-request', request, { headers });
    }

    submitOffer(webID: string, projectURL: string, requester: string, justification: string, consequences: string, organisationType: string, purpose: string, sellingData: boolean, sellingInsights: boolean, techOrgMeasures: string[], recipients: string[], recipientJustification: string, duration: number, durationJustification: string, jurisdiction: string, thirdCountries: string[], thirdCountriesJustification: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const offer = {
            "project": projectURL,
            "user": webID,
            "requester": requester,
            "hasJustification": justification,
            "hasConsequence": consequences,
            "organisation": organisationType,
            "purpose": purpose,
            "sellingData": sellingData,
            "sellingInsights": sellingInsights,
            "measures": techOrgMeasures,
            "recipients": recipients,
            "recipientsJustification": recipientJustification,
            "untilTimeDuration": duration,
            "durationJustification": durationJustification,
            "juridiction": jurisdiction,
            "thirdCountry": thirdCountries,
            "thirdCountryJustification": thirdCountriesJustification
        }
        return this.http.post('http://localhost:3000/api/v1/policy/submit-offer', offer, { headers });
    }

    getProject(projectID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('projectID', projectID);
        return this.http.get('http://localhost:3000/api/v1/project/project', { headers, params });
    }

    updateStatus(projectID: string, status: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/project/update-project', { projectID, status }, { headers });
    }

    revokeApproval(policyURL: string, webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/policy/revoke-approval', { policyURL, webID }, { headers });
    }

    removeOffer(policyURL: string, webID: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        const parts = policyURL.split('#');
        const policyID = parts[1];
        const params = new HttpParams().set('policyID', policyID).set('webID', webID);
        return this.http.delete('http://localhost:3000/api/v1/policy/remove-offer', { headers, params });
    }

    adminApproval(policyURL: string, status: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        console.log(policyURL);
        console.log(status)
        return this.http.put('http://localhost:3000/api/v1/policy/admin-approved', { policyURL, status }, { headers });
    }

    thirdPartyApproval(policyURL: string, status: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/policy/thirdparty-approved', { policyURL, status }, { headers });
    }

    changeRules(project: Project): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.put('http://localhost:3000/api/v1/project/update-project', {
            projectID: project.ID, requestEndTime: project.requestEndTime, requestStartTime: project.requestStartTime, offerEndTime: project.offerEndTime, threshold: project.threshold
        }, { headers });
    }
}
