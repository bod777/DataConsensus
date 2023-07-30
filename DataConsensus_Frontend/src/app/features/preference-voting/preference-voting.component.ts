import { Component, Input } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { VoteService } from '../../services/vote.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-preference-voting',
    templateUrl: './preference-voting.component.html',
    styleUrls: ['./preference-voting.component.css']
})
export class PreferenceVotingComponent {
    @Input() offerRanking: any[] = [];
    @Input() projectID: string = '';

    constructor(private voteService: VoteService, private _snackBar: MatSnackBar) { }

    user: string = localStorage.getItem('user') || "";

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
}
