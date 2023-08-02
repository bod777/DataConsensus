import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { interval } from 'rxjs';
import { PolicyService } from '../services/policy.service';
import { CommentService } from '../services/comment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common'
import { VoteService } from '../services/vote.service';
import { DateService } from '../services/date.service';
import { UserService } from '../services/user.service';
import { environment } from '../../environments/environment';
import { measuresOptions, purposeOptions, organisationOptions } from '../model/mapping';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {

    constructor(private voteService: VoteService, private userService: UserService, private dateService: DateService, private commentService: CommentService, private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar, public datepipe: DatePipe) { }

    showProgressBar: boolean = false;
    progress: number = 0;
    loading: boolean = true;
    broken: boolean = false;
    user: string = localStorage.getItem("webID") || "";
    userType: string = localStorage.getItem("userType") || "";
    tab: string = 'overview';
    projectID: string = "";
    projectStatus: string = "Pending";
    project: any = {};
    request: any = {};
    offers: any[] = [];
    agreement: any = {};
    offerRanking: any[] = [];
    existingVote: any = {};
    toBeApproved: string = "";
    downvoteState: boolean = false;
    upvoteState: boolean = false;
    comments: any[] = [];
    requestResult: boolean = false;
    requestDownvotes: Number = 0;
    requestUpvotes: Number = 0;
    requestAbstentions: Number = 0;
    offerResult: any = {};

    // Function to update the selected tab
    setSelectedTab(tab: string) {
        this.tab = tab;
    }

    downvote() {
        this.downvoteState = true;
        this.upvoteState = false;
        this.voteService.downvote(this.user, this.request.URL, this.projectID).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error downvoting request: " + error, "Close");
            }
        );
    }

    upvote() {
        this.upvoteState = true;
        this.downvoteState = false;
        this.voteService.upvote(this.user, this.request.URL, this.projectID).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error upvoting request: " + error, "Close");
            }
        );
    }

    adminReject() {
        this.showProgressBar = true;
        const interval$ = interval(500);
        const subscription = interval$.subscribe(() => {
            this.progress += 10;
            if (this.progress >= 100) {
                this.showProgressBar = false;
                subscription.unsubscribe();
                this.progress = 0;
            }
        });
        this.policyService.adminApproval(this.toBeApproved, "Rejected").subscribe(
            (response) => {
                this.projectStatus = "Closed";
                this._snackBar.open("Successfully rejected policy", "Close", { duration: 3000 });
                this.ngOnInit();
                window.location.reload();
            },
            (error) => {
                console.error(error);
                this._snackBar.open("Error rejecting policy: " + error, "Close");
            }
        );
    }

    thirdPartyReject() {
        this.showProgressBar = true;
        const interval$ = interval(500);
        const subscription = interval$.subscribe(() => {
            this.progress += 10;
            if (this.progress >= 100) {
                this.showProgressBar = false;
                subscription.unsubscribe();
                this.progress = 0;
            }
        });
        this.policyService.thirdPartyApproval(this.toBeApproved, "Rejected").subscribe(
            (response) => {
                this.projectStatus = "Closed";
                this.ngOnInit();
                window.location.reload();
                this._snackBar.open("Successfully rejected policy", "Close", { duration: 3000 });
            },
            (error) => {
                console.error(error);
                this._snackBar.open("Error rejecting policy: " + error, "Close");
            }
        );
    }

    adminApprove() {
        this.showProgressBar = true;
        const interval$ = interval(500);
        const subscription = interval$.subscribe(() => {
            this.progress += 10;
            if (this.progress >= 100) {
                this.showProgressBar = false;
                subscription.unsubscribe();
                this.progress = 0;
            }
        });
        this.policyService.adminApproval(this.toBeApproved, "Approved").subscribe(
            (response) => {
                this.projectStatus = "Closed";
                this.project.projectStatus = "Closed";
                this.project.hasAgreement = true;
                this.project.hasAccess = true;
                this._snackBar.open("Successfully approved policy", "Close", { duration: 3000 });
                this.ngOnInit();
                window.location.reload();
            },
            (error) => {
                console.error(error);
                this._snackBar.open("Error approving policy: " + error, "Close");
            }
        );
    }

    thirdPartyApprove() {
        this.showProgressBar = true;
        const interval$ = interval(500);
        const subscription = interval$.subscribe(() => {
            this.progress += 10;
            if (this.progress >= 100) {
                this.showProgressBar = false;
                subscription.unsubscribe();
                this.progress = 0;
            }
        });
        this.policyService.thirdPartyApproval(this.toBeApproved, "Approved").subscribe(
            (response) => {
                this.projectStatus = "AdminApprovalNeeded";
                this.ngOnInit();
                window.location.reload();
                this._snackBar.open("Successfully approved policy", "Close", { duration: 3000 });
            },
            (error) => {
                console.error(error);
                this._snackBar.open("Error approving policy: " + error, "Close");
            }
        );
    }

    removeAgreement() {
        this.policyService.removeAgreement(this.agreement.ID).subscribe(
            (response) => {
                this.project.hasAgreement = false;
                this.project.hasAccess = false;
                this.agreement = {};
                this.ngOnInit();
                window.location.reload();
                this._snackBar.open("Successfully removed agreement", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error in removing agreement: " + error, "Close");
            }
        );
    }

    removeProposal(policyURL: string) {
        this.policyService.removeProposal(policyURL, this.user).subscribe(
            (response) => {
                this.ngOnInit();
                window.location.reload();
                this._snackBar.open("Successfully removed agreement", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error in removing agreement: " + error, "Close");
            }
        );
    }

    navigateToSubmitOffer() {
        this.router.navigate(['/submit-offer'], { queryParams: { requestID: this.request.ID } });
    }

    navigateToProfile(webID: string) {
        this.router.navigate(['/profile'], { queryParams: { webID: webID } });
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.projectID = params["projectID"];
            this.tab = params["tab"] ?? 'overview';
        });
        this.policyService.getProject(this.projectID).subscribe(
            (project: any) => {
                console.log(project.data)
                this.project = project.data;
                this.userService.getMemberCount(this.project.requestEndTime).subscribe(
                    (member: any) => {
                        this.project.requestCutoff = Math.ceil(member.data * this.project.threshold);
                    }
                );
                this.userService.getMemberCount(this.project.offerEndTime).subscribe(
                    (member: any) => {
                        this.project.offerCutoff = Math.ceil(member.data * this.project.threshold);
                    }
                );
                this.projectStatus = this.project.projectStatus;
                this.project.projectCreationTime = new Date(this.project.projectCreationTime);
                this.project.requestStartTime = new Date(this.project.requestStartTime);
                this.project.requestEndTime = new Date(this.project.requestEndTime);
                this.project.offerEndTime = new Date(this.project.offerEndTime);
                this.project.organisation = organisationOptions[this.project.organisation] || this.project.organisation;
                // this.project.hasAgreement = this.project.hasAgreement === "true" ? true : false;
                this.project.threshold = Number(this.project.threshold);
                if (this.project.projectPolicies.requests.length > 0) {
                    this.project.projectPolicies.requests[0].policyCreationTime = new Date(this.project.projectPolicies.requests[0].policyCreationTime)
                    this.project.projectPolicies.requests[0].untilTimeDuration = new Date(this.project.projectPolicies.requests[0].untilTimeDuration)
                    this.project.projectPolicies.requests[0].techOrgMeasures = this.project.projectPolicies.requests[0].techOrgMeasures.map((measure: string) => {
                        return measuresOptions[measure] || measure;
                    });
                    this.project.projectPolicies.requests[0].purpose = purposeOptions[this.project.projectPolicies.requests[0].purpose] || this.project.projectPolicies.requests[0].purpose;
                    this.project.projectPolicies.requests[0].organisation = organisationOptions[this.project.projectPolicies.requests[0].organisation] || this.project.projectPolicies.requests[0].organisation;
                    this.project.projectPolicies.requests[0].projectCreationTime = new Date(this.project.projectPolicies.requests[0].projectCreationTime);
                    this.project.projectPolicies.requests[0].requestStartTime = new Date(this.project.projectPolicies.requests[0].requestStartTime);
                    this.project.projectPolicies.requests[0].requestEndTime = new Date(this.project.projectPolicies.requests[0].requestEndTime);
                    this.project.projectPolicies.requests[0].offerEndTime = new Date(this.project.projectPolicies.requests[0].offerEndTime);
                    this.project.projectPolicies.requests[0].threshold = Number(this.project.projectPolicies.requests[0].threshold);
                    this.request = this.project.projectPolicies.requests[0];
                    if (this.userType === "MEMBER") {
                        this.voteService.getVote(this.user, this.request.ID).subscribe(
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
                                if (error.status !== "No votes found") {
                                    console.error(error);
                                    this._snackBar.open("Error fetching existing vote: " + error, "Close");
                                }
                            }
                        );
                    }
                    if (project.data.projectPolicies.offers.length > 0) {
                        this.project.projectPolicies.offers.forEach((offer: any) => {
                            offer.policyCreationTime = new Date(offer.policyCreationTime);
                            offer.untilTimeDuration = new Date(offer.untilTimeDuration);
                            offer.projectCreationTime = new Date(offer.projectCreationTime);
                            offer.requestStartTime = new Date(offer.requestStartTime);
                            offer.requestEndTime = new Date(offer.requestEndTime);
                            offer.offerEndTime = new Date(offer.offerEndTime);
                            offer.techOrgMeasures = offer.techOrgMeasures.map((measure: string) => {
                                return measuresOptions[measure] || measure;
                            });
                            offer.purpose = purposeOptions[offer.purpose] || offer.purpose;
                            offer.organisation = organisationOptions[offer.organisation] || offer.organisation;
                            offer.threshold = Number(offer.threshold);
                        });
                        this.offers = this.project.projectPolicies.offers;
                        if (this.userType === "MEMBER" && this.projectStatus === "OfferDeliberation") {
                            this.voteService.getPreference(this.user, this.projectID).subscribe(
                                (vote: any) => {
                                    this.offerRanking = vote.data;
                                    console.log(this.offerRanking);
                                },
                                (error) => {
                                    this._snackBar.open("Error retrieving offer preference: " + error, "Close");
                                }
                            );
                        }
                    }
                    if (this.project.projectPolicies.agreements.length > 0) {
                        this.project.projectPolicies.agreements[0].policyCreationTime = new Date(this.project.projectPolicies.agreements[0].policyCreationTime);
                        this.project.projectPolicies.agreements[0].untilTimeDuration = new Date(this.project.projectPolicies.agreements[0].untilTimeDuration);
                        this.project.projectPolicies.agreements[0].projectCreationTime = new Date(this.project.projectPolicies.agreements[0].projectCreationTime);
                        this.project.projectPolicies.agreements[0].requestStartTime = new Date(this.project.projectPolicies.agreements[0].requestStartTime);
                        this.project.projectPolicies.agreements[0].requestEndTime = new Date(this.project.projectPolicies.agreements[0].requestEndTime);
                        this.project.projectPolicies.agreements[0].offerEndTime = new Date(this.project.projectPolicies.agreements[0].offerEndTime);
                        this.project.projectPolicies.agreements[0].techOrgMeasures = this.project.projectPolicies.agreements[0].techOrgMeasures.map((measure: string) => {
                            return measuresOptions[measure] || measure;
                        });
                        this.project.projectPolicies.agreements[0].purpose = purposeOptions[this.project.projectPolicies.agreements[0].purpose] || this.project.projectPolicies.agreements[0].purpose;
                        this.project.projectPolicies.agreements[0].organisation = organisationOptions[this.project.projectPolicies.agreements[0].organisation] || this.project.projectPolicies.agreements[0].organisation;
                        this.project.projectPolicies.agreements[0].threshold = Number(this.project.projectPolicies.agreements[0].threshold);
                        this.agreement = this.project.projectPolicies.agreements[0];
                    }
                }

                // Fetching request results after the initial results fetch
                if (this.request && this.projectStatus !== "Pending" && this.projectStatus !== "RequestDeliberation") {
                    this.voteService.getRequestResult(this.request.ID, this.project.requestEndTime.toISOString()).subscribe(
                        (response) => {
                            this.requestResult = response.result;
                            this.requestDownvotes = response.downvotes;
                            this.requestUpvotes = response.upvotes;
                            this.requestAbstentions = response.abstentions;
                            if (this.requestResult === true) {
                                this.toBeApproved = this.request.URL;
                                this.loading = false;
                                console.log(this.loading);
                            }
                        },
                        (error) => {
                            console.log(error);
                            this._snackBar.open("Error in fetching request deliberation result: " + error, "Close");
                            this.broken = true;
                        }
                    );
                }
                // Fetching offer results after the initial results fetch
                if (this.projectStatus !== "Pending" && this.projectStatus !== "RequestDeliberation" && this.projectStatus !== "OfferDeliberation" && this.offers.length !== 0) {
                    this.voteService.getOfferResult(this.projectID, this.project.offerEndTime.toISOString()).subscribe(
                        (response) => {
                            this.offerResult = response.winner;
                            if (this.offerResult !== "rejection") {
                                this.toBeApproved = this.offerResult;
                            }
                            this.loading = false;
                            console.log(this.loading);
                        },
                        (error) => {
                            console.log(error);
                            this._snackBar.open("Error in fetching offer deliberation result. Try Refreshing. Error: " + error.message, "Close");
                            this.broken = true;
                        }
                    );
                } else {
                    this.loading = false;
                }
            },
            (error) => {
                this._snackBar.open("Error retrieving project. Try refreshing. Error:" + error, "Close");
                this.loading = false;
                this.broken = true;
            }
        );
    }
}
