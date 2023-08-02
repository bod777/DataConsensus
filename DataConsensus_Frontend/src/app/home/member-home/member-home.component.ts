import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../model/project.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'member-home',
    templateUrl: './member-home.component.html',
    styleUrls: ['./member-home.component.css']
})

export class MemberHomeComponent implements OnInit {

    constructor(private policyService: PolicyService, private router: Router, private _snackBar: MatSnackBar) {

    }

    broken: boolean = false;
    loading: boolean = true;
    public dataSource = new MatTableDataSource<Project>([]);

    ngOnInit() {
        this.policyService.getAllProjects().subscribe(
            (response) => {
                // console.log(response.data);
                let projects = response.data;
                // projects = projects.map((project: Project) => {
                //     project.projectCreationTime = new Date(project.projectCreationTime);
                //     project.requestStartTime = new Date(project.requestStartTime);
                //     project.requestEndTime = new Date(project.requestEndTime);
                //     project.offerEndTime = new Date(project.offerEndTime);
                //     return project;
                // });
                projects = projects.filter((project: Project) => {
                    return project.projectStatus !== "Removed";
                });
                this.dataSource.data = projects;
                this.loading = false;
            },
            (error) => {
                this._snackBar.open("Error fetching projects. Try refreshing. Error:" + error, "Close");
                this.broken = true;
            }
        );
    }
    // ngAfterViewInit() {
    //     this.dataSource.sort = this.sort;
    // }
}