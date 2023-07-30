import { Pipe, PipeTransform } from '@angular/core';
import { projectStatusOptions } from '../model/mapping';


@Pipe({
  name: 'backendToFrontend'
})
export class BackendToFrontendPipe implements PipeTransform {

  transform(backendValue: string): string {
    return projectStatusOptions[backendValue] || backendValue;
  }

}
