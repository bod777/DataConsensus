import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { PolicyService } from '../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

@Component({
    selector: 'app-submit-request',
    templateUrl: './submit-request.component.html',
    styleUrls: ['./submit-request.component.css']
})
export class SubmitRequestComponent implements OnInit {


    constructor(private policyService: PolicyService, private _snackBar: MatSnackBar, private router: Router) {

    }

    webID: string = localStorage.getItem('webID') || "";
    title: string = "";
    description: string = "";
    organisationType: string = "";
    techOrgMeasures: string[] = [];
    purpose: string = "";
    sellingData: boolean = false;
    sellingInsights: boolean = false;
    duration: number = Date.now();
    request: any = {}

    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    recipients: string[] = [this.webID];
    recipient: string = "";

    announcer = inject(LiveAnnouncer);

    measuresOptions: { displayText: string; value: string }[] = [
        { displayText: 'Consultation with DPO', value: 'ConsultationWithDPO' },
        { displayText: 'Certification Seal', value: 'CertificationSeal' },
        { displayText: 'Code of Conduct', value: 'CodeOfConduct' },
        { displayText: 'Privacy by Default', value: 'PrivacyByDefault' },
        { displayText: 'Design Standard', value: 'DesignStandard' },
        { displayText: 'Professional Training', value: 'ProfessionalTraining' },
        { displayText: 'Cybersecurity Training', value: 'CybersecurityTraining' },
        { displayText: 'Data Protection Training', value: 'DataProtectionTraining' },
        { displayText: 'NDA', value: 'NDA' },
        { displayText: 'Data Processing Agreement', value: 'DataProcessingAgreement' },
        { displayText: 'Asset Management Procedures', value: 'AssetManagementProcedures' },
        { displayText: 'Logging Policies', value: 'LoggingPolicies' },
        { displayText: 'Monitoring Policies', value: 'MonitoringPolicies' },
        { displayText: 'Compliance Monitoring', value: 'ComplianceMonitoring' },
        { displayText: 'Incident Management Procedures', value: 'IncidentManagementProcedures' },
        { displayText: 'Incident Reporting Communication', value: 'IncidentReportingCommunication' },
        { displayText: 'Review Procedure', value: 'ReviewProcedure' },
        { displayText: 'Multi-Factor Authentication', value: 'MultiFactorAuthentication' },
        { displayText: 'Password Authentication', value: 'PasswordAuthentication' },
        { displayText: 'Single Sign-On', value: 'SingleSignOn' },
        { displayText: 'Usage Control', value: 'UsageControl' },
        { displayText: 'Physical Assess Control Method', value: 'PhysicalAssessControlMethod' },
        { displayText: 'Operating System Security', value: 'OperatingSystemSecurity' },
        { displayText: 'Network Security Protocols', value: 'NeworkSecurityProtocols' },
        { displayText: 'Cryptographic Methods', value: 'CryptographicMethods' },
        { displayText: 'Encryption In Use', value: 'EncryptionInUse' },
        { displayText: 'Encryption In Transfer', value: 'EncryptionInTransfer' },
        { displayText: 'Encryption At Rest', value: 'EncryptionAtRest' },
        { displayText: 'End-to-End Encryption', value: 'EndToEndEncryption' }
    ];

    submit() {
        this.policyService.submitRequest(this.webID, this.title, this.description, this.organisationType, this.purpose, this.sellingData, this.sellingInsights, this.techOrgMeasures, this.recipients, this.duration).subscribe(
            (profile) => {
                this.request = profile.data;
                this._snackBar.open("Request submitted successfully", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error submitting request: " + error, "Close", { duration: 3000 });
            }
        );
        this.router.navigate(['/project'], { queryParams: { projectID: this.request.isPartOf } })
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
