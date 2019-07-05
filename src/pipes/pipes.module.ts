import { NgModule } from '@angular/core';
import { FormatDate } from './format-date.pipe';
import { JudgingSystem } from './judging-system.pipe';
import { FormatTimePipe } from './format-time/format-time';

@NgModule({
  declarations: [FormatDate, JudgingSystem,
    FormatTimePipe],
  exports: [FormatDate, JudgingSystem,
    FormatTimePipe]
})
export class PipesModule { }
