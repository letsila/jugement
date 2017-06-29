import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DbService } from "../../services/db.service";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html'
})
export class SettingsPage {

  public judgeId: string = localStorage.getItem("judgeId");

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  public saveJudgeId() {
    console.log(this.judgeId);
    localStorage.setItem("judgeId", this.judgeId);
  }

}
