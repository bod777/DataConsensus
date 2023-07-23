import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'agreement',
    templateUrl: './agreement.component.html',
    styleUrls: ['./agreement.component.css']
})

export class AgreementComponent implements OnInit {

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
            (profile: any) => {
                console.log(profile);
                this.uid = profile.data.uid;
                this.creator = profile.data.creator;
                this.policyCreationTime = profile.data.policyCreationTime;
                this.isPartOf = profile.data.isPartOf;
                this.assigner = profile.data.assigner;
                this.assignee = profile.data.assignee;
                this.references = profile.data.references;
                this.purpose = profile.data.purpose;
                this.sellingData = profile.data.sellingData;
                this.sellingInsights = profile.data.sellingInsights;
                this.organisation = profile.data.organisation;
                this.techOrgMeasures = profile.data.techOrgMeasures.join(', ');
                this.recipients = profile.data.recipients.join(', ');
                this.untilTimeDuration = profile.data.untilTimeDuration;
                this.title = profile.data.title;
                this.description = profile.data.description;
                this.projectStatus = profile.data.projectStatus;
                this.hasAgreement = profile.data.hasAgreement;
                this.projectCreationTime = profile.data.projectCreationTime;
                this.deliberationStartTime = profile.data.deliberationStartTime;
                this.requestTime = profile.data.requestTime;
                this.offerTime = profile.data.offerTime;
                this.threshold = profile.data.threshold;
                this.thresholdType = profile.data.thresholdType;
            },
            (error: any) => {
                this._snackBar.open("Error retrieving profile: " + error, "Close", { duration: 3000 });
            }
        );
    }
}
