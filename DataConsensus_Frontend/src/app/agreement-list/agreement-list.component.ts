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
    <agreement-card *ngIf="!isLoading" [dataArray]="agreements"></agreement-card>
    <mat-spinner *ngIf="isLoading" class="spinner"></mat-spinner>
  `,
    styleUrls: ['./agreement-list.component.css']
})

export class AgreementListComponent implements OnInit {
    agreements: any[] = [];
    isLoading: boolean = true;

    constructor(private policyService: PolicyService, private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.policyService.getAllAgreements().subscribe(
            (data) => {
                this.agreements = data.data;
                this.isLoading = false;
            },
            (error) => {
                console.log(error);
                this._snackBar.open("Error fetching agreements. Try refreshing. Error:" + error, "Close", { duration: 30000 });
            }
        );
    }
}
