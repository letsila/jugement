import { Pipe } from '@angular/core';
import { SYSTEM21 } from '../constants/judging-systems';

@Pipe({
  name: 'judgingSystem'
})
export class JudgingSystem {

  /**
   * Retourne la date formatté dd/mm/yy h:i 
   *
   * @param judgingSystemId
   * @returns {any}
   */
  public transform(judgingSystemId) {
    if (judgingSystemId == SYSTEM21) {
      return "2.1"
    } else {
      return "Skating"
    }
  }
}
