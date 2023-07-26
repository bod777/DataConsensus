import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { Agreement } from '../model/agreement.interface';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'agreement-list',
    template: `
    <h1>Agreements</h1>
    <agreement-card [dataArray]="dataArray"></agreement-card>
  `,
    styleUrls: ['./agreement-list.component.css']
})

export class AgreementListComponent implements OnInit {
    dataArray: any[] = [];

    constructor(private policyService: PolicyService) { }

    ngOnInit() {
        this.policyService.getAllAgreements().subscribe(
            (data) => {
                this.dataArray = data.data;
            },
            (error) => {
                console.log(error);
            });
    }
}
