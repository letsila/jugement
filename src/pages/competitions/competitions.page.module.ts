import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompetitionsPage } from './competitions.page';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    CompetitionsPage
  ],
  imports: [
    IonicPageModule.forChild(CompetitionsPage),
    PipesModule
  ]
})
export class CompetitionsPageModule { }