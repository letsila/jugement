import { Component, ViewChild } from '@angular/core';
import { IonicPage, Menu, Nav, NavController, NavParams } from 'ionic-angular';
import { Subject } from 'rxjs';


@IonicPage({
  segment: 'menu'
})
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.page.html',
})
export class MenuPage {
  @ViewChild('content') content: Nav;
  @ViewChild(Menu) menu: Menu;
  activePage = new Subject();

  rootPage: any = 'LoginPage';
  pages: Array<{ title: string, component: any, active: boolean, icon: string }>;
  public menuRoot = 'LoginPage';

  constructor(public navCtrl: NavController,
    public navParams: NavParams) {
    this.initPages();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  initPages() {
    this.pages = [
      { title: 'Scrutation', component: 'ScrutationPage', active: true, icon: 'stats' },
      { title: 'Réglages', component: 'SettingsPage', active: false, icon: 'cog' },
      { title: 'Compétitions', component: 'CompetitionsPage', active: false, icon: 'trophy' }
    ];

    this.activePage.subscribe((selectedPage: any) => {
      this.pages.map(page => {
        page.active = page.title === selectedPage.title;
      });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.content.setRoot(page.component);
    this.activePage.next(page);
  }

}
