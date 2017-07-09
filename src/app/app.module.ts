import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { LoginPopover } from "../popovers/login/login.popover";
import { CompetitionPopover } from "../popovers/competition/competition.popover";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DbService } from "../services/db.service";

@NgModule({
  declarations: [
    MyApp,
    LoginPopover,
    CompetitionPopover,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPopover,
    CompetitionPopover
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DbService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
