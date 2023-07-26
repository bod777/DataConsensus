import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgFor } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { AppRoutingModule } from './app-routing.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DatePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

// services
import { UserService } from './services/user.service';
import { PolicyService } from './services/policy.service';

// components
import { AppComponent } from './app.component';

import { LoginComponent } from './auth/login/login.component';
import { MemberSignUpComponent } from './auth/member-signup/member-signup.component';
import { ThirdPartySignUpComponent } from './auth/thirdparty-signup/thirdparty-signup.component';

import { AppLayoutComponent } from './app-layout/app-layout.component';
import { MenuComponent } from './features/menu/menu.component';

import { HomeComponent } from './home/home.component';
import { MemberHomeComponent } from './home/member-home/member-home.component';
import { ThirdPartyHomeComponent } from './home/thirdparty-home/thirdparty-home.component';
import { AdminHomeComponent } from './home/admin-home/admin-home.component';

import { ProfileComponent } from './profile/profile.component';
import { MemberProfileComponent } from './profile/member-profile/member-profile.component';
import { ThirdPartyProfileComponent } from './profile/thirdparty-profile/thirdparty-profile.component';
import { AdminProfileComponent } from './profile/admin-profile/admin-profile.component';

import { AgreementListComponent } from './agreement-list/agreement-list.component';
import { AgreementCardComponent } from './features/agreement-card/agreement-card.component';
import { IndividualAgreementComponent } from './individual-agreement/individual-agreement.component';

import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { ProjectPageComponent } from './project-page/project-page.component';
import { SubmitOfferComponent } from './submit-offer/submit-offer.component';

import { CommentSectionComponent } from './features/comments/comments.component';
import { PreferenceVotingComponent } from './features/preference-voting/preference-voting.component';
import { RequestCardComponent } from './features/request-card/request-card.component';
import { TabsComponent } from './features/tabs/tabs.component';



@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MemberSignUpComponent,
        ThirdPartySignUpComponent,
        MenuComponent,
        HomeComponent,
        MemberHomeComponent,
        ThirdPartyHomeComponent,
        AdminHomeComponent,
        ProfileComponent,
        MemberProfileComponent,
        ThirdPartyProfileComponent,
        AdminProfileComponent,
        CommentSectionComponent,
        PreferenceVotingComponent,
        RequestCardComponent,
        SubmitRequestComponent,
        SubmitOfferComponent,
        ProjectPageComponent,
        TabsComponent,
        AppLayoutComponent,
        IndividualAgreementComponent,
        AgreementCardComponent,
        AgreementListComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatGridListModule,
        MatMenuModule,
        MatIconModule,
        MatButtonToggleModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatSelectModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatListModule,
        MatTabsModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        ScrollingModule,
        MatFormFieldModule,
        MatChipsModule,
        MatAutocompleteModule,
        NgFor,
        MatTableModule,
        MatSidenavModule,
        DragDropModule
    ],
    exports: [
        MenuComponent,
        CommentSectionComponent,
        AgreementCardComponent,
        TabsComponent
    ],
    providers: [UserService, PolicyService, DatePipe,
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }