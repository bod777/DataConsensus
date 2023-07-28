import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'agreement-card',
    template: `
    <div class = "card-container">
        <mat-card *ngFor="let item of dataArray">
            <mat-card-header>
                <mat-card-title>{{ item.title }}</mat-card-title>
                <mat-card-subtitle>Third Party: {{ item.assignee }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
                <p>{{ item.description }}</p>
                <mat-card-subtitle>Ends On: {{ item.untilTimeDuration }}</mat-card-subtitle>
            </mat-card-content>
            <mat-card-actions>
                <button mat-raised-button color="primary" (click)="redirectToAgreementPage(item.isPartOf)">View</button>
            </mat-card-actions>
        </mat-card>
    </div>
    `,
    styleUrls: ['./agreement-card.component.css']
})
export class AgreementCardComponent {
    @Input() dataArray: any[] = []; // Make sure to define the correct type for the data array.

    constructor(private router: Router) { }

    redirectToAgreementPage(agreementURL: string) {
        console.log(agreementURL);
        const hashIndex = agreementURL.lastIndexOf("#");
        const policyID = agreementURL.substring(hashIndex + 1);
        this.router.navigate([`/project`], { queryParams: { projectID: policyID, tab: "agreement" } });
    }
}
