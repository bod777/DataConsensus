import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'agreement-card',
    templateUrl: './agreement-card.component.html',
    styleUrls: ['./agreement-card.component.css']
})
export class AgreementCardComponent {
    @Input() dataArray: any[] = []; // Make sure to define the correct type for the data array.

    constructor(private router: Router) { }

    navigateToProfile(webID: string) {
        this.router.navigate(['/profile'], { queryParams: { webID: webID } });
    }

    redirectToAgreementPage(agreementURL: string) {
        console.log(agreementURL);
        const hashIndex = agreementURL.lastIndexOf("#");
        const policyID = agreementURL.substring(hashIndex + 1);
        this.router.navigate([`/project`], { queryParams: { projectID: policyID, tab: "agreement" } });
    }
}
