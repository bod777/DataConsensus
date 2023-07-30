import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'policy-status',
    templateUrl: './policy-status.component.html',
    styleUrls: ['./policy-status.component.css'],
})
export class PolicyStatusComponent {
    @Input() policy: any = {};
}