import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../model/project.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'thirdparty-home',
    templateUrl: './thirdparty-home.component.html',
    styleUrls: ['./thirdparty-home.component.css']
})

export class ThirdPartyHomeComponent implements OnInit {

    constructor(private policyService: PolicyService, private router: Router, private _snackBar: MatSnackBar) { }

    user: string = localStorage.getItem('webID') || '';
    loading: boolean = true;
    public dataSource = new MatTableDataSource<Project>([]);
    displayedColumns = ['title', 'creator', 'projectCreationTime', 'projectStatus', 'buttons']

    isRelevant(project: Project) {
        let isRelevant = false;
        if (project.creator === this.user) {
            isRelevant = true;
        }
        return isRelevant;
    }

    navigateToProfile(webID: string) {
        this.router.navigate(['/profile'], { queryParams: { webID: webID } });
    }

    @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
        this.dataSource.paginator = paginator;
    }
    @ViewChild(MatSort) set matSort(sort: MatSort) {
        // this needs to be a setter to ensure sort is added AFTER it is defined in the template, otherwise it won't work
        this.dataSource.sort = sort;
    }

    navigateToProject(projectID: string) {
        this.router.navigate([`/project`], { queryParams: { projectID: projectID } });
    }

    ngOnInit() {
        this.policyService.getAllProjects().subscribe(
            (response) => {
                let projects = response.data;
                projects = projects.map((project: Project) => {
                    project.projectCreationTime = new Date(project.projectCreationTime);
                    project.requestStartTime = new Date(project.requestStartTime);
                    project.requestEndTime = new Date(project.requestEndTime);
                    project.offerEndTime = new Date(project.offerEndTime);
                    return project;
                });
                const activeProjects = projects.filter((project: Project) => this.isRelevant(project));
                this.dataSource.data = activeProjects;
                this.loading = false;
            },
            (error) => {
                this._snackBar.open("Error fetching projects. Try refreshing. Error:" + error, "Close", { duration: 30000 });
            }
        );
    }
}