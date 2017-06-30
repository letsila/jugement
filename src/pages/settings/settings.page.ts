import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DbService } from "../../services/db.service";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html'
})
export class SettingsPage {

  public judgeId: string = localStorage.getItem("judgeId");
  public dossards: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public dossardAliases: string[];
  public dossardAliases1: string[];
  public dossardAliases2: string[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: DbService) {
  }

  ngOnInit() {
    this.db.get("dossards")
      .then(res => {
        this.dossardAliases = res.aliases;
        this.dossardAliases1 = this.dossardAliases.splice(0, 5);
        this.dossardAliases2 = this.dossardAliases.splice(5, 9);
      })
      .catch(e => {
        console.log(e);
      })
  }

  public change() {
    console.log("changed ...");
    console.log(this.dossardAliases);

    this.db.get("dossards").then(res => {
      res.aliases = this.dossardAliases;
      this.db.put(res).then(() => {
        // this.dossardAliases = 
      });
    }).catch(e => {
      console.log(e);
    })
  }

  public saveJudgeId() {
    console.log(this.judgeId);
    localStorage.setItem("judgeId", this.judgeId);
  }

}
