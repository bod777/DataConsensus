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
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { measuresOptions, countryOptions, organisationOptions, purposeOptions } from '../model/mapping';

@Component({
    selector: 'app-submit-request',
    templateUrl: './submit-request.component.html',
    styleUrls: ['./submit-request.component.css']
})
export class SubmitRequestComponent implements OnInit {


    constructor(private policyService: PolicyService, private _snackBar: MatSnackBar, private router: Router) {

    }

    showProgressBar: boolean = false;
    progress: number = 0;
    webID: string = localStorage.getItem('webID') || "";
    title: string = "";
    description: string = "";
    justification: string = "";
    consequences: string = "";
    organisationType: string = "";
    techOrgMeasures: string[] = [];
    purpose: string = "";
    sellingData: boolean = false;
    sellingInsights: boolean = false;
    duration: number = Date.now();
    durationJustification: string = "";
    request: any = {}
    measuresOptions = measuresOptions;
    countryOptions = countryOptions;
    organisationOptions = organisationOptions;
    purposeOptions = purposeOptions;

    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    recipients: string[] = [this.webID];
    recipient: string = "";
    recipientJustification: string = "";

    jurisdiction: string = "IE";
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
        this.policyService.submitRequest(this.webID, this.title, this.description, this.justification, this.consequences, this.organisationType, this.purpose, this.sellingData, this.sellingInsights, this.techOrgMeasures, this.recipients, this.recipientJustification, this.duration, this.durationJustification, this.jurisdiction, this.thirdCountries, this.thirdCountriesJustification).subscribe(
            (profile) => {
                this.request = profile.data;
                console.log(this.request);
                this._snackBar.open("Request submitted successfully", "Close", { duration: 3000 });
                console.log(this.request.isPartOf.split('#')[1]);
                this.router.navigate(['/project'], { queryParams: { projectID: this.request.isPartOf.split('#')[1] } })
            },
            (error) => {
                this._snackBar.open("Error submitting request: " + error, "Close");
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

    ngOnInit() {
    }
}
