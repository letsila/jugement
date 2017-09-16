import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TypesPage } from './types.page';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    TypesPage
  ],
  imports: [
    IonicPageModule.forChild(TypesPage),
    PipesModule
  ]
})
export class TypesPageModule { }