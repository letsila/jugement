import { Component } from "@angular/core";
import { AlertController, IonicPage, MenuController, NavController, ViewController, LoadingController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";
import { SYSTEM21, SKATING, SKATING_FINAL } from "../../constants/judging-systems";

const TO_MUCH = 2;
const NOT_ENOUGH = -1;

@IonicPage()
@Component({
  selector: "page-scrutation",
  templateUrl: "scrutation.page.html"
})
export class ScrutationPage {
  dossards: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45];
  judgeSheets: any[] = [];
  judgeId: string;
  danseFilter: string = "chacha";
  danses: any[] = [];
  criteria = ["tq", "mm", "ps", "cp"];
  dossardsAliases: string[] = [];
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

      this.db.getJudgeSheetOfCompetition(this.competId)
        .then(res => {
          this.judgeSheets = res.rows.map(value => {
            return value.doc;
          });
          console.log(this.judgeSheets);

          this.db.get("dossards-" + this.competId)
            .then(res => {
              this.initCompet(res);
            })
            .catch(e => {
              if (e.name == 'not_found') {
                this.db.get("dossards").then(res => {
                  this.initCompet(res);
                })
              }
            })
        })
        .catch(e => {
          console.log(e);
        })
    })

  }

  isJudgeSheetSKValid(judgeSheet) {
    let checkmarkCount = judgeSheet.dossards.reduce((accumulator, score) => {
      if (score) {
        return accumulator += 1;
      }
      return accumulator;
    }, 0);

    if (this.competition && checkmarkCount > this.competition.nombreSelection) {
      return TO_MUCH;
    } else if (this.competition && checkmarkCount < this.competition.nombreSelection) {
      return NOT_ENOUGH;
    } else {
      return 1;
    }
  }

  initCompet(result) {
    let loading = this.loading.create({ content: "Chargement..." });
    loading.present();

    this.db.get("competitions").then(res => {
      this.db.get('criteria-list').then(criteria => {
        this.competition = _.find(res.list, { id: this.competId });

        // Show only ten aliases if 2.1
        if (this.competition && this.competition.judgingSystem == SYSTEM21) {
          this.dossardsAliases = result.aliases.splice(0, 10);
          this.dossards = this.dossards.splice(0, 10);
        }

        if (this.competition && this.competition.judgingSystem == SKATING) {
          this.dossardsAliases = result.aliases;
        }

        if (this.competition && this.competition.judgingSystem == SKATING_FINAL) {
          this.dossardsAliases = result.aliases.splice(0, 6);
        }

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

            // this.danseFilter = this.danses.length ? this.danses[0].identifier : null;
            this.danseFilter = "chacha";
          })
          .catch(e => console.log(e));
        loading.dismiss();
      })
        .catch(e => console.log(e))
    })
      .catch(e => console.log(e))
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
   * Score global
   * 
   * @param dossardIndex
   */
  overallScoreSK(dossardIndex) {
    let score: number = 0;

    this.danses.forEach(danse => {
      score += Number(this.scoresPerDanseSK(dossardIndex, danse.identifier)) || 0;
    });

    return _.round(score, 3);
  }

  /**
   * Rank overall
   * @param dossardIndex
   */
  rankOverallSK(dossardIndex) {

    let dossardsRanked = this.dossards.map((dossard, index) => {
      let dossardObj: any = {};
      dossardObj.score = this.overallScoreSK(index);
      dossardObj.id = index;
      return dossardObj;
    });

    let dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");
    // console.log(dossardsRanked_ordered);

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
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

  scoresPerDanseSK(dossardIndex, danseFilter = this.danseFilter) {
    let total: number = 0;

    if (this.judgeSheets.length) {
      let sheetsOfTheDanse: any = this.judgeSheets.filter(sheet => {
        return sheet.danse == danseFilter;
      });
      if (sheetsOfTheDanse.length) {
        let scores = [];
        sheetsOfTheDanse.forEach(sheet => {
          scores.push(
            sheet.dossards[Number(dossardIndex)] || 0
          );
        })

        total = scores.filter(val => val).length;
      }
    }
    return total;
  }

  /**
   * Moyenne d'une critere pour un dossard pour une danse.
   */
  meanCriteriaScoreOfDossardId(dossardIndex: number, criteria: string, danseFilter = this.danseFilter) {
    try {

      let mean: number = 0;
      // console.log(this.judgeSheets[0].dossards[0]);
      if (this.judgeSheets.length) {
        // Les feuilles de juges pour la danse en cours.
        let sheetsOfTheDanse: any = this.judgeSheets.filter(sheet => {
          return sheet.danse == danseFilter;
        });
        // console.log(danseFilter);
        // Récupération des scores du dossard pour la danse en cours.
        if (sheetsOfTheDanse.length) {
          let scoresOfTheCriteria = [];
          // sheetsOfTheDanse.forEach(sheet => {
          //   if (sheet.dossards[Number(dossardIndex)] && sheet.dossards[Number(dossardIndex)][criteria]) {
          //     scoresOfTheCriteria.push(
          //       Number(sheet.dossards[Number(dossardIndex)][criteria])
          //     );
          //     // console.log(Number(sheet.dossards[Number(dossardIndex)][criteria]));
          //   } else {
          //     scoresOfTheCriteria.push(
          //       0
          //     );
          //   }
          //   scoresOfTheCriteria = scoresOfTheCriteria.map(el => Number(el));
          // })
          sheetsOfTheDanse.forEach(sheet => {
            scoresOfTheCriteria.push(
              Number(sheet.dossards[Number(dossardIndex)][criteria]) || 0
            );
          })
          mean = this.mean(scoresOfTheCriteria);
        }
      }
      // return 1;
      // return this.judgeSheets[0].dossards[0].tq;
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

    // System 2.1 si le nombre de juge est impair et supérieur à 2
    if (sortedScores.length && sortedScores.length > 2 && sortedScores.length % 2 != 0) {
      const medianIndex = Math.ceil(sortedScores.length / 2) - 1;
      let weights = [];

      const numerator = sortedScores.reduce((accumulator, currentValue) => {
        const distance = Math.abs(currentValue - sortedScores[medianIndex]);
        const weight = 1 / (1 + Math.pow(distance, 2));
        const updatedScore = currentValue * weight;
        weights.push(weight);

        return accumulator + updatedScore;
      }, 0);

      const denominator = _.sum(weights);

      mean = numerator / (denominator);
    }

    // System 2.1 si le nombre de juge est pair et supérieur à 1
    if (sortedScores.length && sortedScores.length > 1 && sortedScores.length % 2 == 0) {
      sortedScores = sortedScores.map((val, index) => {
        if (index == 0 || index == sortedScores.length - 1) {
          return val / 2;
        }
        return val;
      })

      let divider = sortedScores.length > 1 ? sortedScores.length - 1 : 1;
      mean = _.sum(sortedScores) / divider;
    }

    // return sortedScores.length;
    return _.round(mean, 3);
  }

  /**
   * Logout
   */
  logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" })
  }


}