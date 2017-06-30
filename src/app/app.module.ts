import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { JudgeSheetPage } from '../pages/judge-sheet/judge-sheet.page';
import { SettingsPage } from '../pages/settings/settings.page';
import { LoginPage } from "../pages/login/login.page";
import { ScrutationPage } from "../pages/scrutation/scrutation.page";

import { LoginPopover } from "../popovers/login/login.popover";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DbService } from "../services/db.service";

@NgModule({
  declarations: [
    MyApp,
    JudgeSheetPage,
    SettingsPage,
    LoginPage,
    ScrutationPage,
    LoginPopover
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    JudgeSheetPage,
    SettingsPage,
    LoginPage,
    ScrutationPage,
    LoginPopover
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DbService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
