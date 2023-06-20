import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthserviceService } from './authservice.service';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CompanyDashboardComponent } from './company-dashboard/company-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RequestResubmitPageComponent } from './request-resubmit-page/request-resubmit-page.component';
import { MatListModule } from '@angular/material/list';
import { ProfileComponentComponent } from './profile-component/profile-component.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomePageComponent,
    CompanyDashboardComponent,
    UserDashboardComponent,
    RequestResubmitPageComponent,
    ProfileComponentComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    HttpClientModule,
    MatButtonToggleModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore())

  ],
  providers: [AuthserviceService],
  bootstrap: [AppComponent]
})
export class AppModule { }

/*

The app.module.ts file is the main module of your Angular application. It's where you declare which components, directives, and pipes belong to the application. It's also where you specify which other modules and services your application uses. Here's a breakdown of what each part of your app.module.ts file does:

The import statements at the top import various modules, components, and services that your application uses. For example, BrowserModule is Angular's module for browser-specific services, AppRoutingModule is your application's routing module, AppComponent is your application's main component, and LoginComponent is a component for a login page.

The @NgModule decorator is used to define a module. It takes a metadata object that tells Angular how to compile and run the module.

The declarations array is where you declare which components, directives, and pipes belong to this module. Angular uses this array to know which selectors are associated with which components.

The imports array is where you import other modules that your module needs. Components in your module can use the directives, components, and pipes that these imported modules export.

The providers array is where you specify the services that this module provides. These services become available for injection into any component, directive, pipe, or service that is part of the app.

The bootstrap array is where you define the root component of the module. The root component is the first component to be loaded when the application starts.

In your specific app.module.ts file, you're declaring several components like AppComponent, LoginComponent, HomePageComponent, etc. You're also importing several modules like BrowserModule, AppRoutingModule, BrowserAnimationsModule, etc. You're providing the AuthserviceService service, and you're bootstrapping the AppComponent.

The provideFirebaseApp and provideFirestore are used to initialize Firebase and Firestore in your application, using the configuration from your environment file.
*/