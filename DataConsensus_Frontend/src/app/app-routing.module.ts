import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CallbackComponent } from './callback/callback.component';
import { MemberSignUpComponent } from './memberSignUp/memberSignUp.component';
import { ThirdPartySignUpComponent } from './thirdPartySignUp/thirdPartySignUp.component';
import { HomeComponent } from './home/home.component';
import { MemberHomeComponent } from './memberHome/memberHome.component';
import { ThirdPartyHomeComponent } from './thirdPartyHome/thirdPartyHome.component';
import { AdminHomeComponent } from './adminHome/adminHome.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'memberSignup', component: MemberSignUpComponent },
  { path: 'thirdPartySignUp', component: ThirdPartySignUpComponent },
  { path: 'login/callback', component: CallbackComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

/*
Here's a breakdown of your app-routing.module.ts file:

import { NgModule } from '@angular/core';: This line imports the NgModule decorator from Angular's core library. This decorator is used to define a module.

import { RouterModule, Routes } from '@angular/router';: This line imports the RouterModule and Routes from Angular's router library. The RouterModule is a module that provides router service, while Routes is a type used for routing declarations.

The next few lines import the components that will be associated with the routes.

const routes: Routes = [...];: This line defines a constant routes which is an array of route objects. Each route object has a path and a component. The path is the URL that will trigger the route, and the component is the component that will be loaded when the route is triggered.

{ path: '', component: LoginComponent }: This route is for the path '', i.e., the root or home path. When the application URL is the base URL (like http://localhost:4200/), the LoginComponent will be loaded.
The other routes work similarly, loading different components for different paths.

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] }): This is the NgModule decorator being applied to the AppRoutingModule class. It takes a configuration object with the following properties:

imports: This is where you import other modules that your module needs. In this case, you're importing the RouterModule and calling its forRoot method with your routes array. The forRoot method provides the Router service and conducts the initial navigation based on the current browser URL.
exports: This is where you define what this module exports. In this case, you're exporting the RouterModule so that the router directives are available throughout your application.
export class AppRoutingModule { }: This is the AppRoutingModule class being defined. It doesn't have any properties or methods of its own, it's just used to configure the router.
 */