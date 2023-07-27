import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { CommentService } from '../services/comment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common'
import { VoteService } from '../services/vote.service';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { DateService } from '../services/date.service';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {

    constructor(private voteService: VoteService, private dateService: DateService, private commentService: CommentService, private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar, public datepipe: DatePipe) { }

    user: string = localStorage.getItem("webID") || "";
    projectStatus: string = "pending";
    projectID: string = "";
    requestID: string = "";
    agreementID: string = "";
    project: any = {};
    request: any = {};
    offers: any[] = [];
    agreement: any = {};
    offerRanking: any[] = [];
    existingVote: any = {};
    requestStartTime: Date = new Date();
    requestEndTime: Date = new Date();
    offerEndTime: Date = new Date();
    downvoteState: boolean = false;
    upvoteState: boolean = false;
    tab: string = 'overview';
    comments: any[] = [];
    requestResult: any = {};
    offerResult: any = {};

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
        console.log(this.offerRanking);
        moveItemInArray(this.offerRanking, event.previousIndex, event.currentIndex);
    }

    submitRanking(): void {
        // console.log('Submitting ranking:', this.offerRanking);
        const voteArray = this.offerRanking.map((item, index) => ({
            policyURL: item.URL,
            voteRank: index + 1
        }));
        const req = { rankedVotes: voteArray, voter: this.user, projectID: this.projectID };
        // console.log(req);
        this.voteService.submitPreference(req).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
    }

    navigateToSubmitOffer() {
        this.router.navigate(['/submit-offer'], { queryParams: { requestID: this.requestID } });
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
                this.project.projectCreationTime = new Date(this.project.projectCreationTime);
                this.project.requestStartTime = new Date(this.project.requestStartTime);
                this.project.requestEndTime = new Date(this.project.requestEndTime);
                this.project.offerEndTime = new Date(this.project.offerEndTime);
                this.project.hasAgreement = this.project.hasAgreement === "true" ? true : false;

                // Fetching request data
                this.policyService.getRequest(this.requestID).subscribe(
                    (request: any) => {
                        this.request = request.data;
                        this.request.untilTimeDuration = new Date(this.request.untilTimeDuration);
                        this.request.policyCreationTime = new Date(this.request.policyCreationTime);
                    }
                );
                // Fetching Request Vote if it exists
                this.voteService.getVote(this.user, this.requestID).subscribe(
                    (vote: any) => {
                        this.existingVote = vote.data;
                        console.log("Existing vote: ", this.existingVote);
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
                // console.log("Offer URLs: ", offerURLs);
                if (offerURLs.length !== 0) {
                    for (const i in offerURLs) {
                        const URL = offerURLs[i];
                        // console.log("Offer URL: ", URL)
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
                    // console.log("Offer ranking: ", this.offerRanking);
                    // console.log("Offer Data: ", this.offers);
                }
                this.agreementID = this.project.projectPolicies.agreements[0].split("#")[1] || "";
                if (this.agreementID !== "") {
                    this.policyService.getAgreement(this.agreementID).subscribe(
                        (policy) => {
                            this.agreement = policy.data;
                            this.agreement.policyCreationTime = new Date(this.agreement.policyCreationTime);
                            this.agreement.untilTimeDuration = new Date(this.agreement.untilTimeDuration);
                            this.agreement.projectCreationTime = new Date(this.agreement.projectCreationTime);
                            this.agreement.deliberationStartTime = new Date(this.agreement.deliberationStartTime);
                            this.agreement.hasAgreement = this.agreement.hasAgreement === "true" ? true : false;
                            this.agreement.offerTime = Number(this.agreement.offerTime);
                            this.agreement.requestTime = Number(this.agreement.requestTime);
                            this.agreement.threshold = Number(this.agreement.threshold);
                            console.log("Agreement: ", this.agreement);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                }
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
        if (this.dateService.isDatePassed(this.requestStartTime)) {
            this.projectStatus = "request";
            this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                (response) => {
                    console.log(response);
                },
                (error) => {
                    console.log(error);
                }
            );
        }
        if (this.dateService.isDatePassed(this.requestEndTime)) {
            this.voteService.getRequestResult(this.requestID).subscribe(
                (response) => {
                    this.requestResult = response.result;
                    console.log(response);
                },
                (error) => {
                    console.log(error);
                }
            );
            if (this.requestResult === false && this.offers.length !== 0) {
                this.projectStatus = "offer";
                this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                    (response) => {
                        console.log(response);
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            }
            else {
                this.projectStatus = "completed";
            }
            this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                (response) => {
                    console.log(response);
                },
                (error) => {
                    console.log(error);
                }
            );
            // get request result
            // if rejected
            // check if offers exist
            // if yes, then projectStatus = "offer"
            // if no, then projectStatus = "completed"
            // update accordingly
        }
        if (this.projectStatus === "offer" && this.dateService.isDatePassed(this.offerEndTime)) {
            this.projectStatus = "completed";
            this.voteService.getOfferResult(this.projectID).subscribe(
                (response) => {
                    console.log(response);
                },
                (error) => {
                    console.log(error);
                }
            );
            this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                (response) => {
                    console.log(response);
                },
                (error) => {
                    console.log(error);
                }
            );
            // get offer result
            // projectStatus = "completed"
            // update accordingly
        }
    }
}
