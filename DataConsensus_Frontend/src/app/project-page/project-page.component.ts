import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common'
import { VoteService } from '../services/vote.service';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {

    constructor(private voteService: VoteService, private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar, public datepipe: DatePipe) { }

    user: string = localStorage.getItem("webID") || "";
    projectID: string = "";
    requestID: string = "";
    project: any = {};
    request: any = {};
    offers: any[] = [];
    offerRanking: any[] = [];
    tab: string = 'overview'; // Set the initial selected tab to 'overview'

    // Function to update the selected tab
    setSelectedTab(tab: string) {
        this.tab = tab;
    }

    downvote() {
        this.voteService.downvote(this.user, this.request.uid).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
    }

    upvote() {
        this.voteService.upvote(this.user, this.request.uid).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
    }

    onDrop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.offerRanking, event.previousIndex, event.currentIndex);
    }

    submitRanking(): void {
        console.log('Submitting ranking:', this.offerRanking);
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.projectID = params["projectID"];
            console.log(this.projectID);
        });

        this.policyService.getProject(this.projectID).subscribe(
            (project: any) => {
                this.project = project.data;
                const requestURL = project.data.projectPolicies.requests[0];
                const hashIndex = requestURL.lastIndexOf("#");
                const requestID = requestURL.substring(hashIndex + 1);
                this.requestID = requestID;
                this.project.projectCreationTime = this.datepipe.transform(this.project.projectCreationTime, 'dd-MM-yyyy');
                this.project.deliberationStartTime = this.datepipe.transform(this.project.deliberationStartTime, 'dd-MM-yyyy');
                console.log(this.project.projectCreationTime);

                this.policyService.getRequest(this.requestID).subscribe(
                    (request: any) => {
                        console.log(request.data);
                        this.request = request.data;
                        this.request.untilTimeDuration = this.datepipe.transform(this.request.untilTimeDuration, 'dd-MM-yyyy');
                        this.request.policyCreationTime = this.datepipe.transform(this.request.policyCreationTime, 'dd-MM-yyyy');
                    }
                );
                const offerURLs = this.project.projectPolicies.offers;
                for (const i in offerURLs) {
                    const URL = offerURLs[i];
                    const id = URL.substring(URL.lastIndexOf("#") + 1);
                    const offerData = { id, URL };
                    this.offerRanking.push(offerData);
                    console.log(this.offerRanking);
                    this.policyService.getOffer(id).subscribe(
                        (offer: any) => {
                            offer.data.untilTimeDuration = this.datepipe.transform(offer.data.untilTimeDuration, 'dd-MM-yyyy');
                            offer.data.id = id;
                            this.offers.push(offer.data);
                            console.log(this.offers);
                        },
                        (error) => {
                            this._snackBar.open("Error retrieving offer: " + error, "Close", { duration: 3000 });
                        }
                    )
                }
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );


    }
}
