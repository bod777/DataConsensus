import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from 'src/app/model/project.interface';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
// import { FormControl } from '@angular/forms';
// import {
//     NgxMatDateFormats,
//     NGX_MAT_DATE_FORMATS,
// } from '@angular-material-components/datetime-picker';

// export const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
//     parse: {
//         dateInput: 'l, LTS',
//     },
//     display: {
//         dateInput: 'ddd D MMM YYYY HH:mm',
//         monthYearLabel: 'MMM YYYY',
//         dateA11yLabel: 'LL',
//         monthYearA11yLabel: 'MMMM YYYY',
//     },
// };

@Component({
    selector: 'change-rules',
    templateUrl: './change-rules.component.html',
    styleUrls: ['./change-rules.component.css'],
    // providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }],
})
export class ChangeRulesComponent {
    @Input() project: any = {};

    // public myDateControl = new FormControl(new Date());

    constructor(private userService: UserService, private policyService: PolicyService, private _snackBar: MatSnackBar,) { }

    addRequestStartTime(event: MatDatepickerInputEvent<Date>) {
        console.log(event.value);
        this.project.requestStartTime = event.value;
    }

    addRequestEndTime(event: MatDatepickerInputEvent<Date>) {
        console.log(event.value);
        this.project.requestEndTime = event.value;
    }

    addOfferEndTime(event: MatDatepickerInputEvent<Date>) {
        console.log(event.value);
        this.project.offerEndTime = event.value;
    }

    changeRules() {
        this.policyService.changeRules(this.project).subscribe(
            (response) => {
                this._snackBar.open("Successfully changed rules", "Close", { duration: 3000 });

            },
            (error) => {
                this._snackBar.open("Error in changing rules: " + error, "Close", { duration: 3000 });
            }
        );
        this.userService.getMemberCount().subscribe(
            (member: any) => {
                this.project.cutoff = member.data * this.project.threshold;
            }
        );
    }
}
