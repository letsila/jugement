import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings.page';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SettingsPage
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    PipesModule
  ]
})
export class SettingsPageModule { }