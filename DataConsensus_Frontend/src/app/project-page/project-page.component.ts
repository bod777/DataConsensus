import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { CommentService } from '../services/comment.service';
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

    constructor(private voteService: VoteService, private commentService: CommentService, private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar, public datepipe: DatePipe) { }

    user: string = localStorage.getItem("webID") || "";
    projectID: string = "";
    requestID: string = "";
    project: any = {};
    request: any = {};
    offers: any[] = [];
    offerRanking: any[] = [];
    existingVote: any = {};
    downvoteState: boolean = false;
    upvoteState: boolean = false;
    tab: string = 'overview';
    comments: any[] = [];

    // Function to update the selected tab
    setSelectedTab(tab: string) {
        this.tab = tab;
    }

    downvote() {
        this.downvoteState = true;
        this.upvoteState = false;
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
        this.upvoteState = true;
        this.downvoteState = false;
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
        const voteArray = this.offerRanking.map((item, index) => ({
            policyURL: item.URL,
            voteRank: index + 1
        }));
        const req = { rankedVotes: voteArray, voter: this.user };
        console.log(req);
        this.voteService.submitPreference(req).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.projectID = params["projectID"];
        });
        this.voteService.getPreference(this.user, this.projectID).subscribe(
            (vote: any) => {
                console.log("Old offer ranking: ", vote.data);
                this.offerRanking = vote.data;
            },
            (error) => {
                this._snackBar.open("Error retrieving vote: " + error, "Close", { duration: 3000 });
            }
        );
        this.policyService.getProject(this.projectID).subscribe(
            (project: any) => {
                this.project = project.data;
                const requestURL = project.data.projectPolicies.requests[0];
                const hashIndex = requestURL.lastIndexOf("#");
                const requestID = requestURL.substring(hashIndex + 1);
                this.requestID = requestID;
                this.project.projectCreationTime = this.datepipe.transform(this.project.projectCreationTime, 'dd-MM-yyyy');
                this.project.deliberationStartTime = this.datepipe.transform(this.project.deliberationStartTime, 'dd-MM-yyyy');

                this.policyService.getRequest(this.requestID).subscribe(
                    (request: any) => {
                        console.log("Request Data: ", request.data);
                        this.request = request.data;
                        this.request.untilTimeDuration = this.datepipe.transform(this.request.untilTimeDuration, 'dd-MM-yyyy');
                        this.request.policyCreationTime = this.datepipe.transform(this.request.policyCreationTime, 'dd-MM-yyyy');
                    }
                );
                this.voteService.getVote(this.user, this.requestID).subscribe(
                    (vote: any) => {
                        this.existingVote = vote.data;
                        if (this.existingVote) {
                            if (this.existingVote.rank === "1") {
                                this.upvoteState = true;
                                this.downvoteState = false;
                            } else if (this.existingVote.rank === "2") {
                                this.upvoteState = false;
                                this.downvoteState = true;
                            }
                        }
                        else {
                            this.upvoteState = false;
                            this.downvoteState = false;
                        }
                    },
                    (error) => {
                        if (error.status === "No votes found") {
                            console.log(error);
                            this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
                        }
                    }
                );
                const offerURLs = this.project.projectPolicies.offers;
                console.log("Offer URLs: ", offerURLs);
                if (offerURLs.length !== 0) {
                    for (const i in offerURLs) {
                        const URL = offerURLs[i];
                        console.log("Offer URL: ", URL)
                        const id = URL.substring(URL.lastIndexOf("#") + 1);
                        this.policyService.getOffer(id).subscribe(
                            (offer: any) => {
                                offer.data.untilTimeDuration = this.datepipe.transform(offer.data.untilTimeDuration, 'dd-MM-yyyy');
                                offer.data.id = id;
                                this.offers.push(offer.data);
                            },
                            (error) => {
                                this._snackBar.open("Error retrieving offer: " + error, "Close", { duration: 3000 });
                            }
                        )
                    }
                    console.log("Offer ranking: ", this.offerRanking);
                    console.log("Offer Data: ", this.offers);
                }
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );


    }
}
