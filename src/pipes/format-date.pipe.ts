import { Pipe } from '@angular/core';
import { HelperService } from '../services/helper.service';

@Pipe({
  name: 'formatDate'
})
export class FormatDate {

  /**
   * Retourne la date formatté dd/mm/yy h:i 
   *
   * @param timestamp
   * @returns {any}
   */
  public transform(timestamp) {
    return HelperService.getFormatedDateWith(timestamp)
  }
}
