import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from "../pages/login/login.page";
import { JudgeSheetPage } from '../pages/judge-sheet/judge-sheet.page';
import { SettingsPage } from '../pages/settings/settings.page';
import { ScrutationPage } from '../pages/scrutation/scrutation.page';

import { DbService } from "../services/db.service";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{ title: string, component: any }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public db: DbService) {
    this.initializeApp();

    // Always Sync 
    this.db.sync();


    console.log(localStorage.getItem("role"));

    // used for an example of ngFor and navigation
    // if (localStorage.getItem("role") == "scrutateur") {
      this.pages = [
        { title: 'Réglages', component: SettingsPage },
        { title: 'Scrutation', component: ScrutationPage }
      ];
    // } else if (localStorage.getItem("role") == "juge") {
    //   this.pages = [
    //     // { title: 'Feuille de juge', component: JudgeSheetPage }
    //   ];
    // }

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
