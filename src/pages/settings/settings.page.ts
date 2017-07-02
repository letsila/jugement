import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DbService } from "../../services/db.service";
import { LoginPage } from "../login/login.page";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html'
})
export class SettingsPage {

  public judgeId: string = localStorage.getItem("judgeId");
  public dossards: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public dossardAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  public judgeAliases: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: DbService) {
  }

  ngOnInit() {
    this.db.get("dossards")
      .then(res => {
        this.dossardAliases = res.aliases;
      })
      .catch(e => {
        console.log(e);
      })
  }

  ionViewWillLeave() {
    console.log("changed ...");
    console.log(this.dossardAliases);

    this.db.get("dossards").then(res => {
      console.log(res);
      res.aliases = this.dossardAliases;
      this.db.put(res).then(() => {
        // this.dossardAliases = 
      }).catch(e => {
        console.log(e);
      })
    }).catch(e => {
      console.log(e);
    })
  }

  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" })
  }

  public saveJudgeId() {
    console.log(this.judgeId);
    localStorage.setItem("judgeId", this.judgeId);
  }

}
