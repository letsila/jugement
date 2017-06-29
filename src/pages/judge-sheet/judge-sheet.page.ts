import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from "../login/login.page";

@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  public judgeId: string = localStorage.getItem("judgeId");

  constructor(public navCtrl: NavController) {

  }

  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" });
    localStorage.setItem("role", "");
  }

}
