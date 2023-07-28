import { Component, OnInit } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../model/project.interface';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'thirdparty-home',
    templateUrl: './thirdparty-home.component.html',
    styleUrls: ['./thirdparty-home.component.css']
})

export class ThirdPartyHomeComponent implements OnInit {

    constructor(private policyService: PolicyService, private router: Router, private _snackBar: MatSnackBar) {
    }

    user: string = localStorage.getItem('webID') || "";
    activeProjects: any[] = [];

    currentDate: Date = new Date();

    isRelevant(project: Project) {
        let isRelevant = false;
        if (project.creator === this.user) {
            isRelevant = true;
        }
        return isRelevant;
    }

    navigateToProject(project: Project) {
        this.router.navigate([`/project`], { queryParams: { projectID: project.projectID } });
    }

    ngOnInit() {
        this.policyService.getAllProjects().subscribe(
            (response) => {
                const allProjects = response.data;
                const processedProject = allProjects.map((project: Project) => {
                    const lengthRequest = Number(project.requestEndTime);
                    const lengthOffer = Number(project.offerEndTime);
                    const startTime = new Date(project.requestStartTime);
                    const requestEndTime = new Date(startTime.getTime() + lengthRequest * 24 * 60 * 60 * 1000);
                    const offerEndTime = new Date(requestEndTime.getTime() + lengthOffer * 24 * 60 * 60 * 1000);
                    return {
                        ...project,
                        startTime,
                        requestEndTime,
                        offerEndTime,
                    };
                });
                this.activeProjects = processedProject.filter((project: Project) => this.isRelevant(project));
                console.log(this.activeProjects);
            },
            (error) => {
                this._snackBar.open("Error fetching offers: " + error, "Close", { duration: 3000 });
            }
        );
    }
}