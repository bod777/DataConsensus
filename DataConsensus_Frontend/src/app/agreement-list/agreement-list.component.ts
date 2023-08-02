import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { Agreement } from '../model/agreement.interface';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'agreement-list',
    templateUrl: './agreement-list.component.html',
    styleUrls: ['./agreement-list.component.css']
})

export class AgreementListComponent implements OnInit {
    agreements: any[] = [];
    loading: boolean = true;
    broken: boolean = false;

    constructor(private policyService: PolicyService, private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.policyService.getAllAgreements().subscribe(
            (data) => {
                this.agreements = data.data;
                this.loading = false;
            },
            (error) => {
                console.error(error);
                console.log(error.message);
                this.broken = true;
                this.loading = false;
                this._snackBar.open("Error fetching agreements. Try refreshing. Error:" + error, "Close");
            }
        );
    }
}
