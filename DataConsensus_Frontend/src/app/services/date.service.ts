import { Injectable } from '@angular/core';
import * as moment from 'moment'; // If you installed moment.js

@Injectable({
    providedIn: 'root',
})
export class DateService {
    constructor() { }

    isDatePassed(targetDate: Date): boolean {
        const currentDate = moment(); // If you installed moment.js, otherwise use new Date()
        return moment(targetDate).isBefore(currentDate); // If you installed moment.js, otherwise use targetDate < currentDate
    }
}
