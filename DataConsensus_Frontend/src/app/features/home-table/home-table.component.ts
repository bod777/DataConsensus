import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../model/project.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'home-table',
    templateUrl: './home-table.component.html',
    styleUrls: ['./home-table.component.css'],
    // providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }],
})
export class HomeTableComponent {
    @Input() dataSource: any;
    displayedColumns = ['title', 'creator', 'projectCreationTime', 'requestEndTime', 'projectStatus', 'buttons']

    constructor(private router: Router) { }

    @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
        this.dataSource.paginator = paginator;
    }
    @ViewChild(MatSort) set matSort(sort: MatSort) {
        // this needs to be a setter to ensure sort is added AFTER it is defined in the template, otherwise it won't work
        this.dataSource.sort = sort;
    }


    navigateToProfile(webID: string) {
        this.router.navigate(['/profile'], { queryParams: { webID: webID } });
    }

    navigateToProject(projectID: string) {
        this.router.navigate([`/project`], { queryParams: { projectID: projectID } });
    }
}
