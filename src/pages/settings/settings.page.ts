import { Component } from '@angular/core';
import {
  NavController,
  IonicPage,
  MenuController,
  NavParams,
  ViewController,
  LoadingController
} from 'ionic-angular';
import { DbService } from "../../services/db.service";
import * as _ from "lodash";
import { SKATING_FINAL, SYSTEM21, SKATING } from "../../constants/judging-systems";

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html'
})
export class SettingsPage {

  public judgeId: string = localStorage.getItem("judgeId");
  public dossards: number[] = _.range(0, 45, 1); // [1, 2, ..., 45]
  public dossardAliases: string[] = _.range(0, 45, 1).map(String); // ["1", "2", ..., "45"]
  public judgeAliases: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  public competition: any;
  public nombreSelection: number = 8;
  public nombrePassages: number = 1;
  public passages = ['0-10', '10-20', '20-30', '30-40', '40-45'];
  public competId = localStorage.getItem("currentCompetitionId");

  SKATING_FINAL = SKATING_FINAL;
  SYSTEM21 = SYSTEM21;
  SKATING = SKATING;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public db: DbService,
    public menu: MenuController,
    public loading: LoadingController) {
    menu.swipeEnable(true, 'menu');
  }

  get rangeNombrePassages() {
    if (this.nombrePassages > 0) {
      return _.range(0, this.nombrePassages);
    }

    return [];
  }

  get passagesRanges() {
    return this.passages.map(passage => {
      const indexes = passage.split('-');
      if (indexes.length == 2) {
        const start = indexes[0];
        const end = indexes[1];

        return _.range(start, end, 1);
      } else {
        return [];
      }
    });
  }

  inPassagesRanges(index) {
    this.passagesRanges.forEach((range, rangeIndex) => {
      if (range.indexOf(index) !== -1) {
        return rangeIndex;
      }
    })

    return false;
  }

  ionViewDidLoad() {
    this.viewCtrl.didEnter.subscribe(() => {
      this.competId = localStorage.getItem("currentCompetitionId");
      let loading = this.loading.create({ content: "Chargement..." });
      loading.present();

      this.db.get("competitions")
        .then((res) => {
          this.competition = _.find(res.list, { id: this.competId });
          if (this.competition && this.competition.nombreSelection) {
            this.nombreSelection = this.competition.nombreSelection;
          }

          if (this.competition && this.competition.nombrePassages) {
            this.nombrePassages = this.competition.nombrePassages;
          }

          if (this.competition && this.competition.passages) {
            this.passages = this.competition.passages;
          }

          loading.dismiss();
          // Dossards
          this.db.get("dossards-" + this.competId).then(res => {
            if (this.competition && this.competition.judgingSystem == SKATING_FINAL) {
              this.dossards = [1, 2, 3, 4, 5, 6];
            }
            this.dossardAliases = res.aliases;
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
      if (currCompetIndex != -1) {
        res.list[currCompetIndex].nombreSelection = this.nombreSelection;
        res.list[currCompetIndex].nombrePassages = this.nombrePassages;
        res.list[currCompetIndex].passages = this.passages;

        this.db.put(res).then(() => {
          console.log(res);
        });
      }
    }).catch(e => console.log(e));
  }

  public logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" })
  }

  public saveJudgeId() {
    try {
      localStorage.setItem("judgeId", this.judgeId);
    } catch (e) {
      alert("can't set JudgeId")
    }
  }

}
