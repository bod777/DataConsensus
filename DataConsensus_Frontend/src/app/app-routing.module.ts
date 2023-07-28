import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { MemberSignUpComponent } from './auth/member-signup/member-signup.component';
import { ThirdPartySignUpComponent } from './auth/thirdparty-signup/thirdparty-signup.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { SubmitOfferComponent } from './submit-offer/submit-offer.component';
import { AgreementListComponent } from './agreement-list/agreement-list.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { ProjectPageComponent } from './project-page/project-page.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login/callback', component: CallbackComponent },
  { path: 'member-signup', component: MemberSignUpComponent },
  { path: 'thirdparty-signup', component: ThirdPartySignUpComponent },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'agreements', component: AgreementListComponent },
      { path: 'submit-request', component: SubmitRequestComponent },
      { path: 'submit-offer', component: SubmitOfferComponent },
      { path: 'project', component: ProjectPageComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }