import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

/* 
The main.ts file is the entry point of your Angular application. It's where Angular gets bootstrapped and your application starts running. Here's a breakdown of what each part of your main.ts file does:

import { enableProdMode } from '@angular/core';: This line imports the enableProdMode function from Angular's core library. This function is used to turn on production mode in Angular, which disables assertions and other checks within the framework.

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';: This line imports the platformBrowserDynamic function from Angular's platform-browser-dynamic library. This function is used to bootstrap the application in a browser environment.

import { AppModule } from './app/app.module';: This line imports the AppModule from your application's module file. This is the root module of your Angular application.

import { environment } from './environments/environment';: This line imports the environment object from your environment configuration file. This object contains environment-specific information like whether you're in production mode or not.

if (environment.production) { enableProdMode(); }: This line checks if the production property on the environment object is true. If it is, it calls the enableProdMode function to turn on production mode.

platformBrowserDynamic().bootstrapModule(AppModule) .catch(err => console.error(err));: This line bootstraps your Angular application with AppModule as the root module. If there's an error during bootstrapping, it catches that error and logs it to the console.

In summary, the main.ts file is responsible for bootstrapping your Angular application in the appropriate mode (development or production) based on your environment configuration.
*/