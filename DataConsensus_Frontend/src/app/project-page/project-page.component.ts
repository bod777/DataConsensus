import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PolicyService } from '../services/policy.service';
import { CommentService } from '../services/comment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common'
import { VoteService } from '../services/vote.service';
import { DateService } from '../services/date.service';
import { UserService } from '../services/user.service';
import { measuresOptions, projectStatusOptions, purposeOptions, organisationOptions } from '../model/mapping';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {

    constructor(private voteService: VoteService, private userService: UserService, private dateService: DateService, private commentService: CommentService, private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private _snackBar: MatSnackBar, public datepipe: DatePipe) { }

    loading: boolean = true;
    user: string = localStorage.getItem("webID") || "";
    userType: string = localStorage.getItem("userType") || "";
    tab: string = 'overview';
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
    toBeApproved: string = "";
    downvoteState: boolean = false;
    upvoteState: boolean = false;
    comments: any[] = [];
    requestResult: boolean = false;
    requestDownvotes: Number = 0;
    requestUpvotes: Number = 0;
    requestAbstentions: Number = 0;
    offerResult: any = {};
    isActiveAgreement: boolean = false;

    // Function to update the selected tab
    setSelectedTab(tab: string) {
        this.tab = tab;
    }

    downvote() {
        this.downvoteState = true;
        this.upvoteState = false;
        this.voteService.downvote(this.user, this.request.URL).subscribe(
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
        this.voteService.upvote(this.user, this.request.URL).subscribe(
            (vote: any) => {
                this._snackBar.open("Success", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error retrieving project: " + error, "Close", { duration: 3000 });
            }
        );
    }

    changeRules() {
        this.policyService.changeRules(this.project).subscribe(
            (response) => {
                this._snackBar.open("Successfully changed rules", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error in changing rules: " + error, "Close", { duration: 3000 });
            }
        );
        this.userService.getMemberCount().subscribe(
            (member: any) => {
                this.project.cutoff = Math.ceil(member.data * this.project.threshold);
            }
        );
    }

    // NEED TO CHANGE THIS
    adminReject() {
        this.policyService.adminApproval(this.toBeApproved, "Rejected").subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    // NEED TO CHANGE THIS
    thirdPartyReject() {
        this.policyService.thirdPartyApproval(this.toBeApproved, "Rejected").subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    // NEED TO CHANGE THIS
    adminApprove() {
        this.policyService.updateStatus(this.toBeApproved, "Approved").subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    // NEED TO CHANGE THIS
    thirdPartyApprove() {
        this.policyService.updateStatus(this.toBeApproved, "Approved").subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    removeAgreement() {
        this.policyService.removeAgreement(this.agreementID).subscribe(
            (response) => {
                this.project.hasAgreement = false;
                this.agreement = {};
                this.agreementID = "";
                this._snackBar.open("Successfully removed agreement", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error in removing agreement: " + error, "Close", { duration: 3000 });
            }
        );
    }

    removeProposal(policyURL: string) {
        this.policyService.removeProposal(policyURL, this.user).subscribe(
            (response) => {
                this._snackBar.open("Successfully removed agreement", "Close", { duration: 3000 });
            },
            (error) => {
                this._snackBar.open("Error in removing agreement: " + error, "Close", { duration: 3000 });
            }
        );
    }

    navigateToSubmitOffer() {
        this.router.navigate(['/submit-offer'], { queryParams: { requestID: this.requestID } });
    }

    navigateToProfile(webID: string) {
        this.router.navigate(['/profile'], { queryParams: { webID: webID } });
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.projectID = params["projectID"];
            this.tab = params["tab"] ?? 'overview';
        });
        // console.log("1 this.projectID: ", this.projectID);
        this.policyService.getProject(this.projectID).subscribe(
            (project: any) => {
                this.project = project.data;
                this.userService.getMemberCount().subscribe(
                    (member: any) => {
                        this.project.cutoff = Math.ceil(member.data * this.project.threshold);
                    }
                );
                this.projectStatus = this.project.projectStatus;
                this.project.projectCreationTime = new Date(this.project.projectCreationTime);
                this.project.requestStartTime = new Date(this.project.requestStartTime);
                this.project.requestEndTime = new Date(this.project.requestEndTime);
                this.project.offerEndTime = new Date(this.project.offerEndTime);
                this.project.organisation = organisationOptions[this.project.organisation] || this.project.organisation;
                this.project.hasAgreement = this.project.hasAgreement === "true" ? true : false;
                if (project.data.projectPolicies.requests.length > 0) {
                    const requestURL = project.data.projectPolicies.requests[0];
                    const hashIndex = requestURL.lastIndexOf("#");
                    const requestID = requestURL.substring(hashIndex + 1);
                    this.requestID = requestID;
                    this.policyService.getRequest(this.requestID).subscribe(
                        (request: any) => {
                            this.request = request.data;
                            this.request.untilTimeDuration = new Date(this.request.untilTimeDuration);
                            this.request.policyCreationTime = new Date(this.request.policyCreationTime);
                            this.request.techOrgMeasures = this.request.techOrgMeasures.map((measure: string) => {
                                return measuresOptions[measure] || measure;
                            });
                            this.request.purpose = purposeOptions[this.request.purpose] || this.request.purpose;
                            this.request.organisation = organisationOptions[this.request.organisation] || this.request.organisation;
                            // console.log(this.request);
                        },
                        (error) => {
                            console.log(error);
                            this._snackBar.open("Error retrieving request: " + error, "Close", { duration: 3000 });
                        }
                    );

                    // console.log("7 this.request", this.request);
                    // Fetching Request Vote if it exists
                    if (this.userType === "MEMBER") {
                        this.voteService.getVote(this.user, this.requestID).subscribe(
                            (vote: any) => {
                                this.existingVote = vote.data;
                                // console.log("Existing vote: ", this.existingVote);
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
                                    console.log(error);
                                    this._snackBar.open("Error fetching existing vote: " + error, "Close", { duration: 3000 });
                                }
                            }
                        );
                    }
                }
                // console.log("8 this.existingVote", this.existingVote);
                const offerURLs = this.project.projectPolicies.offers;
                // console.log("9 offerURLs length", offerURLs.length);
                // console.log("Offer URLs: ", offerURLs);
                if (offerURLs.length !== 0) {
                    if (this.userType === "MEMBER" && this.projectStatus === "RequestDeliberation") {
                        this.voteService.getPreference(this.user, this.projectID).subscribe(
                            (vote: any) => {
                                // console.log("Old offer ranking: ", vote.data);
                                this.offerRanking = vote.data;
                            },
                            (error) => {
                                this._snackBar.open("Error retrieving offer preference: " + error, "Close", { duration: 3000 });
                            }
                        );
                    }
                    // console.log("2 this.offerRanking: ", this.offerRanking);
                    for (const i in offerURLs) {
                        const URL = offerURLs[i];
                        const id = URL.substring(URL.lastIndexOf("#") + 1);
                        this.policyService.getOffer(id).subscribe(
                            (offer: any) => {
                                offer.data.policyCreationTime = new Date(offer.data.policyCreationTime);
                                offer.data.untilTimeDuration = new Date(offer.data.untilTimeDuration);
                                offer.data.techOrgMeasures = offer.data.techOrgMeasures.map((measure: string) => {
                                    return measuresOptions[measure] || measure;
                                });
                                offer.data.purpose = purposeOptions[offer.data.purpose] || offer.data.purpose;
                                offer.data.organisation = organisationOptions[offer.data.organisation] || offer.data.organisation;
                                this.offers.push(offer.data);
                            },
                            (error) => {
                                console.log(error);
                                this._snackBar.open("Error retrieving offer: " + error, "Close", { duration: 3000 });
                            }
                        )
                    }
                }
                if (this.projectStatus !== "Closed") {
                    if (this.dateService.isDatePassed(this.project.requestStartTime)) {
                        // console.log("Request Deliberation");
                        this.projectStatus = "RequestDeliberation";
                        this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                            (response) => {
                                this._snackBar.open("Successfully updated project status to RequestDeliberation", "Close", { duration: 3000 });
                            },
                            (error) => {
                                console.log(error);
                                this._snackBar.open("Error updated project status: " + error, "Close", { duration: 3000 });
                            }
                        );
                    }

                    if ((this.projectStatus === "OfferDeliberation" || this.projectStatus === "ThirdPartyApprovalNeeded" || this.projectStatus === "AdminApprovalNeeded") && this.dateService.isDatePassed(this.project.offerEndTime)) {
                        if (this.projectStatus === "OfferDeliberation") {
                            // console.log("Third Party Approval Needed");
                            this.projectStatus = "ThirdPartyApprovalNeeded";
                            this.voteService.getOfferResult(this.projectID).subscribe(
                                (response) => {
                                    this.offerResult = response.winner;
                                    this.toBeApproved = this.offerResult;
                                    // console.log("Offer Result: ", response);
                                    this._snackBar.open("Successfully fetched offer deliberation results", "Close", { duration: 3000 });
                                },
                                (error) => {
                                    console.log(error);
                                    this._snackBar.open("Error in fetching offer deliberation results: " + error, "Close", { duration: 3000 });
                                }
                            );
                            this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                                (response) => {
                                    this._snackBar.open("Successfully updated project status to OfferDeliberation", "Close", { duration: 3000 });
                                },
                                (error) => {
                                    console.log(error);
                                    this._snackBar.open("Error updated project status: " + error, "Close", { duration: 3000 });
                                }
                            );
                        }
                    }

                    if (this.dateService.isDatePassed(this.project.requestEndTime)) {

                        this.voteService.getRequestResult(this.requestID).subscribe(
                            (response) => {
                                this.requestResult = response.result;
                                this.requestDownvotes = response.downvotes;
                                this.requestUpvotes = response.upvotes;
                                this.requestAbstentions = response.abstentions;
                                this._snackBar.open("Successfully fetched request deliberation result", "Close", { duration: 3000 });
                            },
                            (error) => {
                                console.log(error);
                                this._snackBar.open("Error in fetching request deliberation result: " + error, "Close", { duration: 3000 });
                            }
                        );
                        // console.log("Checking for offers")
                        if (this.requestResult === false && this.offers.length !== 0) {
                            // console.log("Offer Deliberation");
                            this.projectStatus = "OfferDeliberation";
                        }
                        else {
                            // console.log("Admin Approval Needed");
                            this.toBeApproved = this.request.URL;
                            this.projectStatus = "AdminApprovalNeeded";
                        }
                        this.policyService.updateStatus(this.projectID, this.projectStatus).subscribe(
                            (response) => {
                                this._snackBar.open(`Successfully updated project status to ${this.projectStatus}`, "Close", { duration: 3000 });
                            },
                            (error) => {
                                console.log(error);
                                this._snackBar.open("Error updated project status: " + error, "Close", { duration: 3000 });
                            }
                        );
                    }
                } else {
                    if (this.requestID !== "") {
                        this.voteService.getRequestResult(this.requestID).subscribe(
                            (response) => {
                                this.requestResult = response.result;
                                this.requestDownvotes = response.downvotes;
                                this.requestUpvotes = response.upvotes;
                                this.requestAbstentions = response.abstentions;
                                this._snackBar.open("Successfully fetched request deliberation result", "Close", { duration: 3000 });
                            },
                            (error) => {
                                console.log(error);
                                this._snackBar.open("Error in fetching request deliberation result: " + error, "Close", { duration: 3000 });
                            }
                        );
                        if (this.offers.length !== 0) {
                            this.voteService.getOfferResult(this.projectID).subscribe(
                                (response) => {
                                    this.offerResult = response.winner;
                                    // console.log("Offer Result: ", response);
                                    this._snackBar.open("Successfully fetched offer deliberation result", "Close", { duration: 3000 });
                                },
                                (error) => {
                                    console.log(error);
                                    this._snackBar.open("Error in fetching offer deliberation result: " + error, "Close", { duration: 3000 });
                                }
                            );
                        }
                        if (this.project.hasAgreement) {
                            this.agreementID = this.project.projectPolicies.agreements[0].split("#")[1] || "";
                            this.policyService.getAgreement(this.agreementID).subscribe(
                                (policy) => {
                                    console.log(policy.data);
                                    this.agreement = policy.data;
                                    this.agreement.policyCreationTime = new Date(this.agreement.policyCreationTime);
                                    this.agreement.untilTimeDuration = new Date(this.agreement.untilTimeDuration);
                                    this._snackBar.open("Successfully fetched agreement", "Close", { duration: 3000 });
                                },
                                (error) => {
                                    console.log(error);
                                    this._snackBar.open("Error in fetching agreement: " + error, "Close", { duration: 3000 });
                                }
                            );
                        }
                        this.isActiveAgreement = !(this.dateService.isDatePassed(this.agreement.untilTimeDuration));
                    }
                }
            },
            (error) => {
                this._snackBar.open("Error retrieving project. Try refreshing. Error:" + error, "Close", { duration: 30000 });
            }
        );
    }
}
