import { FormControl } from '@angular/forms';

export class ScoreValidator {

  static isValid(control: FormControl) {

    if (isNaN(control.value)) {
      return {
        "not a number": true
      }
    }

    if (control.value === 0 || control.value === '0') {
      return {
        "zero value": true
      }
    }

    if (control.value > 10) {
      return {
        "greater than max": true
      }
    }

    return null;
  }
}