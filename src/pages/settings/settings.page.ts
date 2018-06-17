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

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html'
})
export class SettingsPage {

  public judgeId: string = localStorage.getItem("judgeId");
  public dossards: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public dossardAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
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
      let loading = this.loading.create({ content: "Chargement..." });
      loading.present();

      this.db.get("competitions")
        .then((res) => {
          this.competition = _.find(res.list, { id: this.competId });

          // Dossards
          this.db.get("dossards")
            .then(res => {
              this.dossardAliases = res.aliases;
              loading.dismiss();
            })
        })
        .catch(e => {
          console.log(e)
        })
    })
  }

  ionViewWillLeave() {

    this.db.get("dossards").then(res => {
      res.aliases = this.dossardAliases;
      this.db.put(res).then(() => { // this.dossardAliases = 
      });

      this.db.get("competitions").then(res => {
        const currCompetIndex = _.findIndex(res.list, { id: this.competId });
        res.list[currCompetIndex].nombreSelection = this.nombreSelection;

        this.db.put(res).then(() => {
        });
      });
    }).catch(e => {
      console.log(e);
    })
  }

  public logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" })
  }

  public saveJudgeId() {
    console.log(this.judgeId);
    localStorage.setItem("judgeId", this.judgeId);
  }

}
