import { Component } from "@angular/core";
import { AlertController, IonicPage, MenuController, NavController, ViewController, LoadingController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: "page-scrutation",
  templateUrl: "scrutation.page.html"
})
export class ScrutationPage {
  dossards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  judgeSheets: any[] = [];
  judgeId: string;
  danseFilter: string;
  danses: any[] = [];
  criteria = ["tq", "mm", "ps", "cp"];
  dossardsAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];;
  competition: any;
  competId: any;

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public db: DbService,
    public viewCtrl: ViewController,
    public loading: LoadingController,
    public menu: MenuController,
  ) {
    menu.swipeEnable(true, 'menu');
  }

  ionViewDidLoad() {
    this.viewCtrl.didEnter.subscribe(() => {
      this.competId = localStorage.getItem("currentCompetitionId");
      let loading = this.loading.create({ content: "Chargement..." });
      loading.present();

      this.db.getJudgeSheetOfCompetition(this.competId)
        .then(res => {
          this.judgeSheets = res.rows.map(value => {
            return value.doc;
          });

          this.db.get("dossards")
            .then(res => {
              this.dossardsAliases = res.aliases;

              this.db.get("competitions").then(res => {
                this.db.get('criteria-list').then(criteria => {
                  this.competition = _.find(res.list, { id: this.competId });

                  if (this.competition && this.competition.type.criteria && this.competition.type.criteria.length) {
                    this.criteria = criteria.list.filter(critere => {
                      return this.competition.type.criteria.indexOf(critere.id) != -1;
                    }).map(critere => {
                      return critere.short;
                    })
                  }

                  this.db.get("danses")
                    .then(res => {
                      this.danses = res.list.filter(danse => {
                        if (this.competition) {
                          return danse.competitions
                            .indexOf(this.competition.type.id) != -1;
                        }
                      });

                      this.danseFilter = this.danses.length? this.danses[0].id : null;
                    })
                    .catch(e => console.log(e));
                  loading.dismiss();
                })
                  .catch(e => console.log(e))
              })
                .catch(e => console.log(e))
            })
            .catch(e => console.log(e))
        })
        .catch(e => {
          console.log(e);
        })
    })

  }


  doRefresh(refresher) {
    this.db.getJudgeSheetOfCompetition(this.competId)
      .then(res => {
        this.judgeSheets = res.rows.map(value => {
          return value.doc;
        });

        refresher.cancel();
      })
      .catch(e => {
        console.log(e);
      })
  }

  /**
   * Nombre de feuille de danse pour la
   * danse spécifiée.
   * 
   * @param danse
   */
  countJudgeSheetsOfDanse(danse: string) {
    return this.judgeSheets.filter(sheet => {
      return sheet.danse == danse;
    }).length;
  }

  /**
   * Score global
   * 
   * @param dossardIndex
   */
  overallScore(dossardIndex) {
    let score: number = 0;

    this.danses.forEach(danse => {
      score += Number(this.scoresPerDanse(dossardIndex, danse.identifier)) || 0;
    });

    return _.round(score, 3);
  }

  /**
   * Rank overall
   * @param dossardIndex
   */
  rankOverall(dossardIndex) {

    let dossardsRanked = this.dossards.map((dossard, index) => {
      let dossardObj: any = {};
      dossardObj.score = this.overallScore(index);
      dossardObj.id = index;
      return dossardObj;
    });

    let dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");
    // console.log(dossardsRanked_ordered);

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
  }

  /**
   * Alerte de suppression d'une feuille de juge.
   * 
   * @param judgeSheet 
   */
  deleteJudgeSheet(judgeSheet) {
    this.alertCtrl.create({
      title: "Attention !",
      message: "Etes-vous certain de vouloir supprimer cette feuille ?",
      buttons: [
        {
          text: "Oui",
          role: "confirm",
          handler: () => {
            this.appliqueDeleteSheet(judgeSheet);
          }
        },
        {
          text: "Non",
          role: "cancel",
          handler: () => {
          }
        }
      ]
    })
      .present();
  }

  /**
   * Appliquer la suppression d'une feuille de juge.
   * 
   * @param judgeSheet 
   */
  appliqueDeleteSheet(judgeSheet) {
    this.db.get(judgeSheet._id).then(sheet => {
      // sheet._deleted = true;
      this.db.remove(sheet)
        .then(() => {
          const index = _.findIndex(this.judgeSheets, { id: judgeSheet.id });
          this.judgeSheets.splice(index, 1);
        })
    }).catch(e => {
      console.log(e);
    })
  }

  /**
   * Rank per danse of the dossard.
   */
  rankPerDanse(dossardIndex, danseFilter = this.danseFilter) {
    let dossardsRanked = this.dossards.map((dossard, index) => {
      let dossardObj: any = {};
      dossardObj.score = this.scoresPerDanse(index, danseFilter);
      dossardObj.danse = danseFilter;
      dossardObj.id = index;
      return dossardObj;
    });

    let dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
  }

  /**
   * Score total par danse pour un dossard
   * 
   * @param dossardIndex 
   * @param danse 
   */
  scoresPerDanse(dossardIndex, danseFilter) {
    let scoresPerDanse: number = 0;
    this.criteria.forEach(criteria => {
      scoresPerDanse += Number(
        this.meanCriteriaScoreOfDossardId(dossardIndex, criteria, danseFilter)
      );
    });

    return _.round(scoresPerDanse, 3);
  }

  /**
   * Moyenne d'une critere pour un dossard pour une danse.
   */
  meanCriteriaScoreOfDossardId(dossardIndex: number, criteria: string, danseFilter = this.danseFilter) {
    try {

      let mean: number = 0;

      if (this.judgeSheets.length) {
        // Les feuilles de juges pour la danse en cours.
        let sheetsOfTheDanse: any = this.judgeSheets.filter(sheet => {
          return sheet.danse == danseFilter;
        });
        // Récupération des scores du dossard pour la danse en cours.
        if (sheetsOfTheDanse.length) {
          let scoresOfTheCriteria = [];
          sheetsOfTheDanse.forEach(sheet => {
            scoresOfTheCriteria.push(
              sheet.dossards[Number(dossardIndex)][criteria] || 0
            );
            scoresOfTheCriteria = scoresOfTheCriteria.map(el => Number(el));
          })
          mean = this.mean(scoresOfTheCriteria);
        }
      }

      return _.round(mean, 3);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Moyenne
   */
  mean(scoresPerJudge: number[]) {
    let mean: number = 0;
    let sortedScores = scoresPerJudge.sort();

    if (sortedScores.length) {
      sortedScores = sortedScores.map((val, index) => {
        if (index == 0 || index == sortedScores.length - 1) {
          return val / 2;
        }
        return val;
      })

      let divider = sortedScores.length > 1 ? sortedScores.length - 1 : 1;
      mean = _.sum(sortedScores) / divider;
    }

    return _.round(mean, 3);
  }

  /**
   * Logout
   */
  logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" })
  }


}