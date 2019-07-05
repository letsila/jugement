import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '../../services/helper.service';

/**
 * Generated class for the formatTimePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(timestamp) {
    return HelperService.getTime(timestamp);
  }
}
