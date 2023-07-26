import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.css']
})
export class TabsComponent {
    tab: string = 'overview'; // Set the initial selected tab to 'overview'

    // Function to update the selected tab
    setSelectedTab(tab: string) {
        this.tab = tab;
    }
}
