import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'project-status',
    templateUrl: './project-status.component.html',
    styleUrls: ['./project-status.component.css'],
})
export class ProjectStatusComponent {
    @Input() projectStatus: string = 'Pending';
    @Input() isActiveAgreement: boolean = false;
    @Input() hasAgreement: boolean = false;
}