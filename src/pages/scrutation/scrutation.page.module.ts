import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScrutationPage } from './scrutation.page';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ScrutationPage
  ],
  imports: [
    IonicPageModule.forChild(ScrutationPage),
    PipesModule
  ],
  exports: [
    ScrutationPage
  ]
})
export class ScrutationPageModule { }