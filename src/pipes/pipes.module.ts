import { NgModule } from '@angular/core';
import { FormatDate } from './format-date.pipe';
import { JudgingSystem } from './judging-system.pipe';

@NgModule({
  declarations: [FormatDate, JudgingSystem],
  exports: [FormatDate, JudgingSystem]
})
export class PipesModule { }
