import { Component, Input, ViewChild } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';


@Component({
    selector: 'change-rules',
    templateUrl: './change-rules.component.html',
    styleUrls: ['./change-rules.component.css'],
})
export class ChangeRulesComponent {
    @Input() project: any = {};
    @ViewChild('picker', { static: true }) picker: any;

    public disabled = false;
    public showSpinners = true;
    public showSeconds = false;
    public touchUi = false;
    public enableMeridian = false;
    public minDate: Date = new Date();
    public maxDate: Date = new Date(`2029-12-31`);
    public stepHour = 1;
    public stepMinute = 1;
    public stepSecond = 1;
    public color: ThemePalette = 'primary';
    public disableMinute = false;
    public hideTime = false;

    public options = [
        { value: true, label: 'True' },
        { value: false, label: 'False' }
    ];

    public listColors = ['primary', 'accent', 'warn'];

    public stepHours = [1, 2, 3, 4, 5];
    public stepMinutes = [1, 5, 10, 15, 20, 25];
    public stepSeconds = [1, 5, 10, 15, 20, 25];

    public dateControl1 = new FormControl(this.project.requestStartTime);
    public dateControl2 = new FormControl(this.project.requestEndTime);
    public dateControl3 = new FormControl(this.project.offerEndTime);

    constructor(private userService: UserService, private policyService: PolicyService, private _snackBar: MatSnackBar,) { }

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
                this.project.cutoff = Math.ceil(member.data * this.project.threshold);
                this.project.requestStartTime = this.dateControl1.value;
                this.project.requestEndTime = this.dateControl2.value;
                this.project.offerEndTime = this.dateControl3.value;
            }
        );
    }
}
