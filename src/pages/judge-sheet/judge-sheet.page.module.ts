import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JudgeSheetPage } from './judge-sheet.page';

@NgModule({
  declarations: [
    JudgeSheetPage
  ],
  imports: [
    IonicPageModule.forChild(JudgeSheetPage)
  ],
  exports: [
    JudgeSheetPage
  ]
})
export class JudgeSheetPageModule { }