import { Injectable, OnInit } from '@angular/core';
import { Session } from '@inrupt/solid-client-authn-browser';
import { User } from './model/user-info';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DataAccessRequest } from './model/data-access-request';
import { SolidDataset, getSolidDataset, getThing, ThingPersisted } from '@inrupt/solid-client';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
}) // This marks the class as one that participates in the dependency injection system so the AuthServiceService class will be available across the whole app.
export class AuthserviceService implements OnInit {

    private REST_API_SERVICE = "http://localhost:3000"; // the base URL of the REST API that the service interacts with.
    constructor(private httpcl: HttpClient) { } // idk what this does. something related to HTTP i assume
    session: Session = new Session();

    //global variable for policies or all submitted requests
    allcompanyRequestsDataset: any;
    userLoggedIn: any;
    selectedPolicy: any;
    policycount: any;


    async registerMember() {
        return await this.httpcl.post(this.REST_API_SERVICE + "/registerMember", { responseType: 'json' });
    }
    async registerThirdParty() {
        return await this.httpcl.post(this.REST_API_SERVICE + "/registerThirdParty", { responseType: 'json' });
    }

    async sendLoginRequest() {
        return await this.httpcl.get(this.REST_API_SERVICE + "/login", { responseType: 'json' });
    } // this.httpcl.get calls the get method of the HttpClient instance (httpcl).

    async checkUser(user: User) {
        return await this.httpcl.post(this.REST_API_SERVICE + "/userLogin", user, { responseType: 'json' });
    }

    async DARRequest(DAR: DataAccessRequest) {
        return await this.httpcl.post(this.REST_API_SERVICE + "/submitCompanyRequest", DAR, { responseType: "json" });
    }

    async getAllCompanyRequests() {
        return await this.httpcl.post<SolidDataset>(this.REST_API_SERVICE + "/allCompanyRequests", null, { responseType: "json" });
    }

    async getRequest(selectedRequest: string): Promise<any> {
        let fieldsToReturn = {
            'assigner': "empty",
            'policy': selectedRequest,
            'purposeVoteAttr': [0, 0, false, ""],
            'timeVoteParams': [0, 0, false, ""],
            'upvote': 0,
            'downvote': 0,
            'yesOrNo': false,
            'history': false,
            "dataselling": false,
            'research': false,
            'analysis': false,
            'date': new Date()
        };
        const requestsURL = `https://storage.inrupt.com/3d5caeb2-617a-41c1-b74a-408ed0bc23f3/private/requests/requests.ttl`;
        try {
            // Refetch the Reading List
            const allRequests = await getSolidDataset(requestsURL, { fetch: fetch });
            this.allcompanyRequestsDataset = allRequests;
            let fullRequest = await getThing(allRequests, "http://example.com#request" + selectedRequest);
            let requestPermissions = fullRequest?.predicates['http://www.w3.org/ns/odrl/2/permission']['blankNodes']?.[0];
            let actions = (requestPermissions as any)?.['http://www.w3.org/ns/odrl/2/action']['namedNodes']?.[0];
            let target = (requestPermissions as any)?.['http://www.w3.org/ns/odrl/2/target']['namedNodes']?.[0];
            let assignee = (requestPermissions as any)?.['http://www.w3.org/ns/odrl/2/assignee']['namedNodes']?.[0];
            let constraint = (requestPermissions as any)?.['http://www.w3.org/ns/odrl/2/constraint']['blankNodes']?.[0];



            fieldsToReturn['actions'] = actions;
            fieldsToReturn['target'] = target;
            fieldsToReturn['assignee'] = assignee;
        } catch (error) {
            console.log(error);
        }
        //assigning the purpose
        let constraint_url = permissionThing?.predicates['http://www.w3.org/ns/odrl/2/constraint']['namedNodes']?.[0];
        constraint_url = constraint_url ? constraint_url : "";
        let constraintThing = getThing(this.allcompanyRequestsDataset, constraint_url);
        let constraintArray = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/and']['namedNodes'];
        let purposeThing, timeConstraintThing, purposeVoteThing;
        constraintArray?.forEach((value: any) => {
            constraintThing = getThing(this.allcompanyRequestsDataset, value);
            if (constraintThing?.predicates['http://www.w3.org/ns/odrl/2/leftOperand']['namedNodes']?.[0] == "https://w3id.org/oac/Purpose") {
                purposeThing = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/rightOperand']?.['namedNodes'];
                if (purposeThing) {
                    purposeThing.forEach((value: any) => {
                        if (value == "https://w3id.org/dpv#ResearchAndDevelopment") {
                            fieldsToReturn['research'] = true;
                        }
                        else if (value == "https://w3id.org/dpv#ServiceUsageAnalytics") {
                            fieldsToReturn['analysis'] = true;
                        }
                    });
                }
                //purpose vote thing;
                fieldsToReturn['purposeVoteAttr'] = this.unveilVoteParams(constraintThing);
            }
            else if (constraintThing?.predicates['http://www.w3.org/ns/odrl/2/leftOperand']['namedNodes']?.[0] == "http://www.w3.org/ns/odrl/2/dateTime") {
                timeConstraintThing = constraintThing?.predicates['http://www.w3.org/ns/odrl/2/rightOperand']?.['literals']?.['http://www.w3.org/2001/XMLSchema#date'][0];
                if (timeConstraintThing) {
                    fieldsToReturn['date'] = new Date(timeConstraintThing);
                }
                fieldsToReturn['timeVoteParams'] = this.unveilVoteParams(constraintThing);
            }
        });
        return fieldsToReturn;
    }

    unveilVoteParams(constraintThing: ThingPersisted) {
        let purposeVoteThing;
        let purposeVoteThing_url: any = constraintThing?.predicates['http://www.w3.org/2002/07/owl#Thing']['namedNodes']?.[0];
        console.log(purposeVoteThing_url);
        purposeVoteThing = getThing(this.allcompanyRequestsDataset, purposeVoteThing_url);
        console.log("purposeVOTETHING");
        console.log(purposeVoteThing);
        let purposeUPVote = purposeVoteThing?.predicates['http://schema.org/upvoteCount']?.['literals']?.['http://www.w3.org/2001/XMLSchema#integer'][0];
        purposeUPVote = purposeUPVote ? purposeUPVote : '0';
        let purposedownVote = purposeVoteThing?.predicates['http://schema.org/downvoteCount']?.['literals']?.['http://www.w3.org/2001/XMLSchema#integer'][0];
        purposedownVote = purposeUPVote ? purposeUPVote : '0';
        let votedGroupThing_url = purposeVoteThing?.predicates['http://d-nb.info/standards/elementset/gnd#GroupOfPersons']['namedNodes']?.[0];
        votedGroupThing_url = votedGroupThing_url ? votedGroupThing_url : "";
        let votedGroupThing = getThing(this.allcompanyRequestsDataset, votedGroupThing_url);
        console.log(votedGroupThing);
        let voteDecision: any, isPresent;
        if (votedGroupThing?.predicates[this.userLoggedIn]) {
            isPresent = true;
            voteDecision = votedGroupThing?.predicates[this.userLoggedIn]['literals']?.['http://www.w3.org/2001/XMLSchema#string']?.[0];
            voteDecision = voteDecision ? voteDecision : "";
        }
        else {
            isPresent = false;
        }
        return [parseInt(purposeUPVote), parseInt(purposedownVote), isPresent, voteDecision];
    }

    ngOnInit(): void {
    }

}

