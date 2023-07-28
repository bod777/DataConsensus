import { Component, OnInit } from '@angular/core';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../model/project.interface';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'member-home',
    templateUrl: './member-home.component.html',
    styleUrls: ['./member-home.component.css']
})

export class MemberHomeComponent implements OnInit {

    constructor(private policyService: PolicyService, private router: Router, private _snackBar: MatSnackBar) {
    }

    activeProjects: any[] = [];

    currentDate: Date = new Date();

    isActive(project: Project) {
        let isActive = false;
        if (project.projectStatus !== "Completed") {
            if (this.currentDate >= project.requestStartTime && this.currentDate <= project.requestEndTime) {
                isActive = true;
            }
            else {
                if (project.projectPolicies.offers.length > 0) {
                    if (this.currentDate >= project.requestEndTime && this.currentDate <= project.offerEndTime) {
                        isActive = true;
                    }
                }
            }
        }
        return isActive;
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
                this.activeProjects = processedProject.filter((project: Project) => this.isActive(project));
                console.log(this.activeProjects);
            },
            (error) => {
                this._snackBar.open("Error fetching offers: " + error, "Close", { duration: 3000 });
            }
        );
    }
}