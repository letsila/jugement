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
  public dossards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public judgeSheets: any[] = [];
  public judgeId: string;
  public danseFilter: string = "chacha";
  public danses: any[] = [];
  public criteria = ["tq", "mm", "ps", "cp"];
  public dossardsAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];;
  public competition: any;
  public competId: any;

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

  ngOnInit() {
    console.log(this.danseFilter);
    this.viewCtrl.didEnter.subscribe(() => {
      this.competId = localStorage.getItem("currentCompetitionId");
      let loading = this.loading.create({ content: "Chargement..." });
      loading.present();

      this.db.getJudgeSheetOfCompetition(this.competId)
        .then(res => {
          console.log(res);
          this.judgeSheets = res.rows.map(value => {
            return value.doc;
          });

          console.log(this.judgeSheets);

          this.db.get("dossards")
            .then(res => {
              this.dossardsAliases = res.aliases;

              this.db.get("competitions").then(res => {
                this.competition = _.find(res.list, { id: this.competId });

                this.db.get("danses")
                  .then(res => {
                    this.danses = res.list.filter(danse => {
                      if (this.competition) {
                        return danse.competitions
                          .indexOf(this.competition.type.id) != -1;
                      }
                    });
                    console.log(this.danses);
                  })
                  .catch(e => console.log(e));
                loading.dismiss();
              })
            })
        })
        .catch(e => {
          console.log(e);
        })
    })
  }


  doRefresh(refresher) {
    this.db.getJudgeSheetOfCompetition(this.competId)
      .then(res => {
        console.log(res);
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

    // console.log(this.danses);
    this.danses.forEach(danse => {
      score += Number(this.scoresPerDanse(dossardIndex)) || 0;
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

  appliqueDeleteSheet(judgeSheet) {
    console.log(judgeSheet);
    this.db.get(judgeSheet._id).then(sheet => {
      // sheet._deleted = true;
      this.db.remove(sheet)
        .then(() => {
          let index = _.findIndex(this.judgeSheets, { id: judgeSheet.id });
          this.judgeSheets.splice(index, 1);
        })
    }).catch(e => {
      console.log(e);
    })
  }

  /**
   * Rank per danse of the dossard.
   */
  rankPerDanse(dossardIndex) {
    let dossardsRanked = this.dossards.map((dossard, index) => {
      let dossardObj: any = {};
      dossardObj.score = this.scoresPerDanse(index);
      dossardObj.danse = this.danseFilter;
      dossardObj.id = index;
      return dossardObj;
    });

    let dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");
    // console.log(dossardsRanked_ordered);

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
  }

  /**
   * Score total par danse pour un dossard
   * 
   * @param dossardIndex 
   * @param danse 
   */
  scoresPerDanse(dossardIndex) {
    let scoresPerDanse: number = 0;
    this.criteria.forEach(criteria => {
      scoresPerDanse += Number(
        this.meanCriteriaScoreOfDossardId(dossardIndex, criteria)
      );
    });

    return _.round(scoresPerDanse, 3);
  }

  /**
   * Moyenne d'une critere pour un dossard pour une danse.
   */
  meanCriteriaScoreOfDossardId(dossardIndex: number, criteria: string) {
    try {

      let mean: number = 0;

      if (this.judgeSheets.length) {
        // Les feuilles de juges pour la danse en cours.
        let sheetsOfTheDanse: any = this.judgeSheets.filter(sheet => {
          return sheet.danse == this.danseFilter;
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
    // console.log(sortedScores);
    let sortedScores = scoresPerJudge.sort();
    // console.log(sortedScores);
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