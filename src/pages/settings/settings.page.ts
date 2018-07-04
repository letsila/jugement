import { Component } from '@angular/core';
import {
  NavController,
  IonicPage,
  MenuController,
  NavParams,
  ViewController,
  LoadingController
} from 'ionic-angular';
// import { SYSTEM21, SKATING } from "../../constants/judging-systems";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";
import { SKATING_FINAL } from "../../constants/judging-systems";

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html'
})
export class SettingsPage {

  public judgeId: string = localStorage.getItem("judgeId");
  public dossards: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45];
  public dossardAliases: string[] = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
    "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
    "41", "42", "43", "44", "45"];
  public judgeAliases: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  public competition: any;
  public nombreSelection: number = 8;
  public competId = localStorage.getItem("currentCompetitionId");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public db: DbService,
    public menu: MenuController,
    public loading: LoadingController) {
    menu.swipeEnable(true, 'menu');
  }

  ionViewDidLoad() {
    this.viewCtrl.didEnter.subscribe(() => {
      this.competId = localStorage.getItem("currentCompetitionId");
      let loading = this.loading.create({ content: "Chargement..." });
      loading.present();

      this.db.get("competitions")
        .then((res) => {
          this.competition = _.find(res.list, { id: this.competId });
          if (this.competition.nombreSelection) {
            this.nombreSelection = this.competition.nombreSelection;
          }

          loading.dismiss();
          // Dossards
          this.db.get("dossards-" + this.competId).then(res => {
            if (this.competition && this.competition.judgingSystem == SKATING_FINAL) {
              this.dossards = [1, 2, 3, 4, 5, 6];
            }
            this.dossardAliases = res.aliases;
            console.log(this.dossards);
          })
            .catch(e => {
              if (e.name == "not_found") {
                this.db.put({
                  _id: "dossards-" + this.competId,
                  aliases: this.dossardAliases
                })
              }
            })
        })
        .catch(e => {
          console.log(e)
        })
    })
  }

  ionViewWillLeave() {

    this.db.get("dossards-" + this.competId).then(res => {
      this.saveAll(res);
    }).catch(e => {
      console.log(e);
    })
  }

  public saveAll(res) {
    res.aliases = this.dossardAliases;
    this.db.put(res).then(() => { // this.dossardAliases = 
    });

    this.db.get("competitions").then(res => {
      const currCompetIndex = _.findIndex(res.list, { id: this.competId });
      res.list[currCompetIndex].nombreSelection = this.nombreSelection;

      this.db.put(res).then(() => {
        console.log(res);
      });
    }).catch(e => console.log(e));
  }

  public logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" })
  }

  public saveJudgeId() {
    localStorage.setItem("judgeId", this.judgeId);
  }

}
