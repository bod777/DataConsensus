import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DataConsensus_Frontend';

}
/* 
The app.component.ts file is the TypeScript file for the root component of your Angular application. Here's a breakdown of what each part of your app.component.ts file does:

import { Component } from '@angular/core';: This line imports the Component decorator from Angular's core library. This decorator is used to define a component.

import { Input } from '@angular/core';: This line imports the Input decorator from Angular's core library. This decorator is used to define input properties, which allow data to be passed into a component. However, in your provided code, it seems that Input is not being used.

@Component({ selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'] }): This is the Component decorator being applied to the AppComponent class. It takes a configuration object with the following properties:

selector: This is the CSS selector that Angular uses to identify this component in a template. In this case, the selector is 'app-root', so Angular will create and insert an instance of AppComponent wherever it finds <app-root></app-root> in a template.
templateUrl: This is the relative path to the HTML template file for this component. In this case, the template is located at ./app.component.html.
styleUrls: This is an array of relative paths to the CSS files for this component. In this case, there is one CSS file located at ./app.component.css.
export class AppComponent { title = 'DataConsensus_Frontend'; }: This is the AppComponent class being defined. It has a single property title which is set to 'solid_collab_angular'. This title property can be used in the component's template to display its value.

In summary, the app.component.ts file defines the AppComponent class and specifies its HTML template and CSS styles. It also sets a title property on the component which can be used in the template.
*/