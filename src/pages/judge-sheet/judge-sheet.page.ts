import { Component, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertController, NavController, NavParams, IonicPage, ViewController } from 'ionic-angular';
import { DbService } from "../../services/db.service";
import { SYSTEM21, SKATING } from "../../constants/judging-systems";

@IonicPage()
@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  criteria?: string[] = this.navParams.get('criteria');
  criteriaLongObj: any = this.navParams.get('criteriaLongObj');
  dossardsAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  judgeId = localStorage.getItem("judgeId");
  sheetId: string;
  judgeIdFilter: string;
  danse: string = localStorage.getItem("danse");
  dossardsSkating = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  dossards: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  dossards1: any[];
  dossards2: any[];
  competitionId = localStorage.getItem("currentCompetitionId");
  currentCompetition = this.navParams.get("currentCompetition");
  scoresForm: any = this.navParams.get('scoresForm');


  constructor(public navCtrl: NavController,
    public db: DbService,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController
  ) {
    this.sheetId = "judge-sheet-" + this.judgeId + "-" +
      this.danse + "-" + this.competitionId;
  }

  get dossardsAliases1() {
    if (this.currentCompetition && this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SYSTEM21) {
      return this.dossardsAliases.slice().splice(0, 5);
    } else {
      return [];
    }
  }

  get dossardsAliases2() {
    if (this.currentCompetition && this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SYSTEM21) {
      return this.dossardsAliases.slice().splice(5, 5);
    } else {
      return [];
    }
  }

  get checkboxColor() {
    const checkedNumber = this.dossardsSkating.filter(value => value).length;

    if (checkedNumber == this.currentCompetition.nombreSelection) {
      return "true";
    } else {
      return "danger";
    }
  }

  ionViewDidLoad() {
    this.viewCtrl.didEnter.subscribe(() => {
      // Création de la feuille au niveau de la base
      // si celle ci n'existe pas encore.
      this.db.get(this.sheetId).then(res => {
        if (this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SYSTEM21) {
          this.criteria.forEach(criteria => {
            res.dossards.forEach((dossard, index) => {
              this.dossards[index][criteria] = dossard[criteria];
            });
          });
        }

        if (this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SKATING) {
          this.dossardsSkating = res.dossards;
        }

        this.db.get("dossards-" + this.currentCompetition.id).then(res => {
          this.dossardsAliases = res.aliases;
        }).catch(e => {
          if (e.name == "not_found" && this.judgeId) {
            this.db.get("dossards").then(res => {
              this.dossardsAliases = res.aliases;
            });
          }
        })
      }).catch(e => {
        if (e.name == "not_found" && this.judgeId) {
          let dossards = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
          if (this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SKATING) {
            dossards = [];
            for (let i = 1; i < 46; i++) {
              dossards.push(0);
            }
          }

          this.db.put({
            _id: this.sheetId,
            judgeId: this.judgeId,
            danse: this.danse,
            competitionId: this.competitionId,
            dossards
          }).catch(e => {
            console.log(e);
          })
        }
      })
    })
  }

  logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" });
    localStorage.setItem("role", "");
  }

  checkBoxChanged() {
    this.db.get(this.sheetId).then(sheet => {
      this.dossardsSkating.forEach((dossard, index) => {
        sheet.dossards[index] = dossard;
      });

      this.db.put(sheet);
    })
      .catch(e => {
        console.log(e);
      });
  }

  inputChanged() {
    this.db.get(this.sheetId).then(sheet => {
      this.criteria.forEach(critere => {
        this.dossards.forEach((dossard, index) => {
          if (!this.scoresForm.controls[critere + index].valid &&
            !this.scoresForm.controls[critere + index].pristine) {
            this.alertCtrl
              .create({
                title: 'Score invalide',
                message: 'Veuillez modifier le score que vous avez saisi',
                buttons: [{
                  text: 'OK',
                  role: 'cancel',
                  handler: () => {
                    console.log('Cancel clicked');
                  }
                }]
              })
              .present();

            sheet.dossards[index][critere] = 0;
          } else {
            sheet.dossards[index][critere] = dossard[critere];
          }
        })
      })

      this.db.put(sheet)

    }).catch(e => {
      console.log(e);
    })
  }

}
