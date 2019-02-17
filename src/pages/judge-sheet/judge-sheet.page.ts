import { Component, ViewChild, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertController, Navbar, NavController, NavParams, IonicPage, ViewController } from 'ionic-angular';
import { DbService } from "../../services/db.service";
import { SYSTEM21, SKATING, SKATING_FINAL } from "../../constants/judging-systems";
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  @ViewChild('navbar') navBar: Navbar;

  criteria?: string[] = this.navParams.get('criteria');
  criteriaLongObj: any = this.navParams.get('criteriaLongObj');
  dossardsAliases: string[] = _.range(0, 45, 1).map(String); // ["1", "2", ..., "45"];
  judgeId = localStorage.getItem("judgeId");
  sheetId: string;
  judgeIdFilter: string;
  danse: string = localStorage.getItem("danse");
  finalSkatingDossardsOrder = [0, 0, 0, 0, 0, 0];
  dossardsSkating = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  dossards: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  dossards1: any[];
  dossards2: any[];
  competitionId = localStorage.getItem("currentCompetitionId");
  currentCompetition = this.navParams.get("currentCompetition");
  scoresForm: any = this.navParams.get('scoresForm');
  scoresLocked: boolean = false;
  callBack: number = 0;
  selectOptions: any;
  passages = [];
  nombrePassages = [];

  SYSTEM21 = SYSTEM21;
  SKATING = SKATING;
  SKATING_FINAL = SKATING_FINAL;

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

  get dossardsAliasesSKFinal() {
    if (this.currentCompetition && this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SKATING_FINAL) {
      return this.dossardsAliases.slice().splice(0, 6);
    } else {
      return [];
    }
  }

  /**
   * Counts the occurence of dossard index in
   * SK final dossards order.
   * @param finalSkatingDossardsOrder 
   */
  get finalSKCounters() {
    const counters = [0, 0, 0, 0, 0, 0];
    if (this.finalSkatingDossardsOrder && this.finalSkatingDossardsOrder.length) {
      this.finalSkatingDossardsOrder.forEach(dossardIndex => {
        counters[dossardIndex] += 1;
      })
    }
    return counters;
  }

  get skFinalIsValid() {
    if (this.currentCompetition && this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SKATING_FINAL) {
      if (this.finalSKCounters && this.finalSKCounters.length) {
        const isValid = this.finalSKCounters
          .some(counter => {
            return counter > 1;
          });

        return !isValid;
      }

      return true;
    }
  }

  isJudgeSheetSystem21NotValid() {
    return this.dossards.some((dossard: Dossard) => {
      return dossard.cp == '0' || dossard.mm == '0' || dossard.ps == '0' || dossard.tq == '0'
        || !dossard.cp || !dossard.mm || !dossard.ps || !dossard.tq;
    })
  }

  get checkboxColor() {
    this.callBack = this.dossardsSkating.filter(value => value).length;

    if (this.callBack == this.currentCompetition.nombreSelection) {
      return "true";
    } else if (this.callBack > this.currentCompetition.nombreSelection) {
      return "danger";
    } else {
      return "warning"
    }
  }

  get remainingCallBack() {
    return Math.abs(this.callBack - this.currentCompetition.nombreSelection);
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = () => {
      if (this.currentCompetition && this.currentCompetition.judgingSystem == SYSTEM21 && this.isJudgeSheetSystem21NotValid()) {
        let alert = this.alertCtrl.create({
          title: 'Feuille invalide !!!',
          subTitle: 'Veuillez vérifier vos scores, certaines valeurs sont invalides',
          buttons: [
            {
              text: 'Corriger',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Ignorer',
              handler: () => {
                this.navCtrl.pop();
              }
            }
          ]
        });
        alert.present();
      } else {
        this.navCtrl.pop();
      }
    };

    this.viewCtrl.didEnter.subscribe(() => {
      // Affichage des dossards en configuration.
      this.db.get("dossards-" + this.currentCompetition.id).then(res => {
        this.dossardsAliases = res.aliases;
      }).catch(e => {
        if (e.name == "not_found" && this.judgeId) {
          this.db.get("dossards").then(res => {
            this.dossardsAliases = res.aliases;
          });
        }
      })

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

          // generate passage ranges
          this.nombrePassages = _.range(0, this.currentCompetition.nombrePassages, 1);

          // 10-20 => [10, 11, ... 20[
          this.passages = this.currentCompetition.passages.map(passage => {
            const indexes = passage.split('-');
            const start = indexes[0];
            const end = indexes[1];

            return _.range(start, end, 1);
          })
        }

        if (this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SKATING_FINAL) {
          this.finalSkatingDossardsOrder = res.finalSkatingDossardsOrder;
        }

      }).catch(e => {
        if (e.name == "not_found" && this.judgeId) {
          let dossards = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
          if (this.currentCompetition.judgingSystem && this.currentCompetition.judgingSystem == SYSTEM21) {
            this.criteria.forEach(criteria => {
              dossards.forEach((dossard, index) => {
                dossards[index][criteria] = 0;
              });
            });
          }
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
            dossards,
            finalSkatingDossardsOrder: [0, 0, 0, 0, 0, 0]
          }).catch(e => {
            console.log(e);
          })
        }
      })
    })
  }

  lockScores() {
    let subTitle = 'Voulez-vous verouiller votre feuille ?';
    let title = 'Vérouillage';
    if (this.scoresLocked) {
      subTitle = 'Voulez-vous déverouiller votre feuille ?';
      title = 'Déverouillage';
    }
    let alert = this.alertCtrl.create({
      title,
      subTitle,
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            this.scoresLocked = !this.scoresLocked;
          }
        }
      ]
    });
    alert.present();
  }

  checkBoxChanged() {
    this.db.get(this.sheetId).then(sheet => {
      this.dossardsSkating.forEach((dossard, index) => {
        sheet.dossards[index] = dossard;
      });

      this.db.put(sheet).catch(e => {
        console.log(e);
      });
    })
      .catch(e => {
        console.log(e);
      });
  }

  rankChanged() {
    this.db.get(this.sheetId).then(sheet => {
      sheet.finalSkatingDossardsOrder = this.finalSkatingDossardsOrder;

      this.db.put(sheet).catch(e => {
        console.log(e);
      });
    }).catch(e => {
      console.log(e);
    })
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
            sheet.dossards[index][critere] = parseFloat(dossard[critere]);
          }
        })
      })

      this.db.put(sheet).catch(e => {
        console.log(e)
      });

    }).catch(e => {
      console.log(e);
    })
  }

}
