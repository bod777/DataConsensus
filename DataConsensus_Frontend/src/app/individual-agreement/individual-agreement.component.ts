import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'individual-agreement',
    templateUrl: './individual-agreement.component.html',
    styleUrls: ['./individual-agreement.component.css']
})

export class IndividualAgreementComponent implements OnInit {

    constructor(private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar) { }

    policyID: string = "";
    uid: string = "";
    creator: string = "";
    policyCreationTime: string = "";
    isPartOf: string = "";
    assigner: string = "";
    assignee: string = "";
    references: string = "";
    purpose: string = "";
    sellingData: string = "";
    sellingInsights: string = "";
    organisation: string = "";
    techOrgMeasures: string = "";
    recipients: string = "";
    untilTimeDuration: string = "";
    title: string = "";
    description: string = "";
    projectStatus: string = "";
    hasAgreement: string = "";
    projectCreationTime: string = "";
    deliberationStartTime: string = "";
    requestTime: string = "";
    offerTime: string = "";
    threshold: string = "";
    thresholdType: string = "";

    async ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.policyID = params["policyID"];
        });

        this.policyService.getAgreement(this.policyID).subscribe(
            (agreement: any) => {
                // console.log(agreement);
                this.uid = agreement.data.uid;
                this.creator = agreement.data.creator;
                this.policyCreationTime = agreement.data.policyCreationTime;
                this.isPartOf = agreement.data.isPartOf;
                this.assigner = agreement.data.assigner;
                this.assignee = agreement.data.assignee;
                this.references = agreement.data.references;
                this.purpose = agreement.data.purpose;
                this.sellingData = agreement.data.sellingData;
                this.sellingInsights = agreement.data.sellingInsights;
                this.organisation = agreement.data.organisation;
                this.techOrgMeasures = agreement.data.techOrgMeasures.join(', ');
                this.recipients = agreement.data.recipients.join(', ');
                this.untilTimeDuration = agreement.data.untilTimeDuration;
                this.title = agreement.data.title;
                this.description = agreement.data.description;
                this.projectStatus = agreement.data.projectStatus;
                this.hasAgreement = agreement.data.hasAgreement;
                this.projectCreationTime = agreement.data.projectCreationTime;
                this.deliberationStartTime = agreement.data.deliberationStartTime;
                this.requestTime = agreement.data.requestTime;
                this.offerTime = agreement.data.offerTime;
                this.threshold = agreement.data.threshold;
                this.thresholdType = agreement.data.thresholdType;
            },
            (error: any) => {
                this._snackBar.open("Error retrieving agreement: " + error, "Close", { duration: 3000 });
            }
        );
    }
}