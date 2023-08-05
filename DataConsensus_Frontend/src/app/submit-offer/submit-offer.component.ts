import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { PolicyService } from '../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { interval } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { measuresOptions, countryOptions, organisationOptions, purposeOptions } from '../model/mapping';

@Component({
    selector: 'app-submit-offer',
    templateUrl: './submit-offer.component.html',
    styleUrls: ['./submit-offer.component.css']
})

export class SubmitOfferComponent {
    constructor(private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar) {
    }

    loading: boolean = true;
    progress: number = 0;
    showProgressBar: boolean = false;
    requestsList = "https://storage.inrupt.com/b41a41bc-203e-4b52-9b91-4278868cd036/app/policies/requests.ttl#";
    requestID: string = "";
    projectURL: string = "";
    webID: string = localStorage.getItem('webID') || "";
    requester: string = "";
    justification: string = "";
    consequences: string = "";
    organisationType: string = "";
    techOrgMeasures: string[] = [];
    purpose: string = "";
    sellingData: boolean = false;
    sellingInsights: boolean = false;
    duration: number = Date.now();
    durationJustification: string = "";
    offer: any = {};
    measuresOptions = measuresOptions;
    countryOptions = countryOptions;
    organisationOptions = organisationOptions;
    purposeOptions = purposeOptions;


    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    recipients: string[] = [this.webID];
    recipient: string = "";
    recipientJustification: string = "";

    jurisdiction: string = "";
    thirdCountries: string[] = [];
    thirdCountry: string = "";
    thirdCountriesJustification: string = "";

    announcer = inject(LiveAnnouncer);

    submit() {
        this.showProgressBar = true;
        const interval$ = interval(500);
        const subscription = interval$.subscribe(() => {
            this.progress += 10;
            if (this.progress >= 100) {
                this.showProgressBar = false;
                subscription.unsubscribe();
                this.progress = 0;
            }
        });
        this.policyService.submitOffer(this.webID, this.projectURL, this.requester, this.jurisdiction, this.consequences, this.organisationType, this.purpose, this.sellingData, this.sellingInsights, this.techOrgMeasures, this.recipients, this.recipientJustification, this.duration, this.durationJustification, this.jurisdiction, this.thirdCountries, this.thirdCountriesJustification).subscribe(
            (profile) => {
                this.offer = profile.data;
                this._snackBar.open("Offer submitted successfully", "Close", { duration: 3000 });
                console.log(this.offer);
                this.router.navigate(['/project'], { queryParams: { projectID: this.offer.isPartOf.split('#')[1] } })
            },
            (error) => {
                this._snackBar.open("Error submitting offer: " + error, "Close");
            }
        );
    }

    cancelChanges() {
        this.ngOnInit();
        window.location.reload();
    }

    addRecipient(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
            this.recipients.push(value);
        }
        event.chipInput!.clear();
    }

    removeRecipient(recipient: any): void {
        const index = this.recipients.indexOf(recipient);

        if (index >= 0) {
            this.recipients.splice(index, 1);

            this.announcer.announce(`Removed ${recipient}`);
        } recipient
    }

    editRecipient(recipient: any, event: MatChipEditedEvent) {
        const value = event.value.trim();

        if (!value) {
            this.removeRecipient(recipient);
            return;
        }

        const index = this.recipients.indexOf(recipient);
        if (index >= 0) {
            this.recipients[index] = value;
        }
    }

    addCountry(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
            this.thirdCountries.push(value);
        }
        event.chipInput!.clear();
    }

    removeCountry(thirdCountry: any): void {
        const index = this.thirdCountries.indexOf(thirdCountry);

        if (index >= 0) {
            this.thirdCountries.splice(index, 1);

            this.announcer.announce(`Removed ${thirdCountry}`);
        }
    }

    editCountry(thirdCountry: any, event: MatChipEditedEvent) {
        const value = event.value.trim();

        if (!value) {
            this.removeRecipient(thirdCountry);
            return;
        }

        const index = this.thirdCountries.indexOf(thirdCountry);
        if (index >= 0) {
            this.thirdCountries[index] = value;
        }
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.requestID = params["requestID"];
        });
        this.policyService.getRequest(this.requestID).subscribe(
            (request) => {
                this.projectURL = request.data.isPartOf;
                this.requester = request.data.assignee;
                this.jurisdiction = request.data.hasJurisdiction;
                this.consequences = request.data.hasConsequences;
                this.organisationType = request.data.organisation;
                this.purpose = request.data.purpose;
                this.sellingData = request.data.sellingData;
                this.sellingInsights = request.data.sellingInsights;
                this.techOrgMeasures = request.data.techOrgMeasures;
                this.recipients = request.data.recipients;
                this.recipientJustification = request.data.recipientJustification;
                this.duration = request.data.untilTimeDuration;
                this.durationJustification = request.data.durationJustification;
                this.jurisdiction = request.data.jurisdiction;
                this.thirdCountries = request.data.thirdCountry;
                this.thirdCountriesJustification = request.data.thirdCountryJustification;
                this.loading = false;
            },
            (error) => {
                this._snackBar.open("Error retrieving request: " + error, "Close", { duration: 3000 });
            }
        );
    }
}
