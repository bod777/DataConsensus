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
    projectStatus: string = "Pending";
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
            this.tab = params["tab"]
        });
        console.log("1 this.projectID: ", this.projectID);

        this.policyService.getProject(this.projectID).subscribe(
            (project: any) => {
                this.project = project.data;
                console.log("3 Project Data", this.project)
                console.log("4 Number of Offers", this.project.projectPolicies.offers.length);
                const requestURL = project.data.projectPolicies.requests[0];
                const hashIndex = requestURL.lastIndexOf("#");
                const requestID = requestURL.substring(hashIndex + 1);
                this.requestID = requestID;
                this.project.projectCreationTime = new Date(this.project.projectCreationTime);
                this.requestStartTime = new Date(this.project.requestStartTime);
                this.requestEndTime = new Date(this.project.requestEndTime);
                this.offerEndTime = new Date(this.project.offerEndTime);
                this.project.hasAgreement = this.project.hasAgreement === "true" ? true : false;
                console.log("this.requestStartTime ", this.requestStartTime);
                console.log("this.requestEndTime ", this.requestEndTime);
                console.log("this.offerEndTime ", this.offerEndTime);
                console.log("5 this.requestID", this.requestID);
                console.log("6 this.project", this.project);
                // Fetching request data
                this.policyService.getRequest(this.requestID).subscribe(
                    (request: any) => {
                        this.request = request.data;
                        this.request.untilTimeDuration = new Date(this.request.untilTimeDuration);
                        this.request.policyCreationTime = new Date(this.request.policyCreationTime);
                    }
                );
                console.log("7 this.request", this.request);
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
                console.log("8 this.existingVote", this.existingVote);
                const offerURLs = this.project.projectPolicies.offers;
                console.log("9 offerURLs length", offerURLs.length);
                // console.log("Offer URLs: ", offerURLs);
                if (offerURLs.length !== 0) {
                    this.voteService.getPreference(this.user, this.projectID).subscribe(
                        (vote: any) => {
                            console.log("Old offer ranking: ", vote.data);
                            this.offerRanking = vote.data;
                        },
                        (error) => {
                            this._snackBar.open("Error retrieving vote: " + error, "Close", { duration: 3000 });
                        }
                    );
                    console.log("2 this.offerRanking: ", this.offerRanking);
                    for (const i in offerURLs) {
                        const URL = offerURLs[i];
                        const id = URL.substring(URL.lastIndexOf("#") + 1);
                        this.policyService.getOffer(id).subscribe(
                            (offer: any) => {
                                offer.data.policyCreationTime = new Date(offer.data.policyCreationTime);
                                offer.data.untilTimeDuration = new Date(offer.data.untilTimeDuration);
                                offer.data.id = id;
                                this.offers.push(offer.data);
                            },
                            (error) => {
                                this._snackBar.open("Error retrieving offer: " + error, "Close", { duration: 3000 });
                            }
                        )
                    }
                }
                this.agreementID = this.project.projectPolicies.agreements[0].split("#")[1] || "";

                if (this.agreementID !== "") {
                    this.policyService.getAgreement(this.agreementID).subscribe(
                        (policy) => {
                            console.log(policy.data);
                            this.agreement = policy.data;
                            this.agreement.policyCreationTime = new Date(this.agreement.policyCreationTime);
                            this.agreement.untilTimeDuration = new Date(this.agreement.untilTimeDuration);
                            // this.agreement.projectCreationTime = new Date(this.agreement.projectCreationTime);
                            // this.agreement.deliberationStartTime = new Date(this.agreement.deliberationStartTime);
                            // this.agreement.hasAgreement = this.agreement.hasAgreement === "true" ? true : false;
                            // this.agreement.offerTime = Number(this.agreement.offerTime);
                            // this.agreement.requestTime = Number(this.agreement.requestTime);
                            // this.agreement.threshold = Number(this.agreement.threshold);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                }
                if (this.dateService.isDatePassed(this.requestStartTime)) {
                    this.projectStatus = "Request";
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
                    console.log("Getting Request Results");
                    this.voteService.getRequestResult(this.requestID).subscribe(
                        (response) => {
                            this.requestResult = response.result;
                            console.log(response);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                    console.log("Checking for offers")
                    if (this.requestResult === false && this.offers.length !== 0) {
                        this.projectStatus = "Offer";
                    }
                    else {
                        this.projectStatus = "Completed";
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
                console.log("checking offerEndTime");
                if (this.projectStatus === "offer" && this.dateService.isDatePassed(this.offerEndTime)) {
                    console.log("Checking offerEndTime")
                    this.projectStatus = "Completed";
                    this.voteService.getOfferResult(this.projectID).subscribe(
                        (response) => {
                            console.log(response);
                            this.requestResult = response.winner;
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
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
    }
}
