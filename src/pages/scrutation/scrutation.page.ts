import { Component } from "@angular/core";
import { AlertController, IonicPage, MenuController, NavController, ViewController, LoadingController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";
import { SYSTEM21, SKATING, SKATING_FINAL } from "../../constants/judging-systems";

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
  avgsCriteriaScoreOfDos = [];
  competId: any;
  competition: any;
  criteria = ["team", "int", "fonc", "evo", "pres"];
  componentFilter: string = "chacha";
  components: any[] = [];
  dossardsAliases: string[] = [];
  judgeId: string;
  jugement: string;
  judgeSheets: JudgeSheet[] = [];
  overAllSKArr = [];
  overAllScoresArr = [];
  rankOverallArr = [];
  rankOverallSKArr = [];
  scoresPerComponentArr = [];
  scoresPerComponentSKArr = [];

  DEFAULT_COMPONENT_ID = "round-1";

  TO_MUCH = 2;
  NOT_ENOUGH = -1;

  SYSTEM21 = SYSTEM21;
  SKATING = SKATING;
  SKATING_FINAL = SKATING_FINAL;

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

  loadAll() {
    return this.db.getJudgeSheetOfCompetition(this.competId)
      .then(res => {
        this.judgeSheets = res.rows.map(value => {
          return value.doc;
        });

        return this.db.get("dossards-" + this.competId)
          .then(res => {
            return this.initCompet(res);
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
  }

  ionViewDidLoad() {
    this.viewCtrl.didEnter.subscribe(() => {
      this.competId = localStorage.getItem("currentCompetitionId");
      if (this.competId) {
        this.loadAll();
      }
    })
  }

  isJudgeSheetSystem21Valid(judgeSheet) {
    return judgeSheet.dossards.some((dossard: Dossard) => {
      return dossard.team == '0' ||
        dossard.int == '0' ||
        dossard.val == '0' ||
        dossard.fonc == '0' ||
        dossard.evo == '0' ||
        dossard.pres == '0' ||
        !dossard.team ||
        !dossard.int ||
        !dossard.val ||
        !dossard.fonc ||
        !dossard.evo ||
        !dossard.pres;
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
      return this.TO_MUCH;
    } else if (this.competition && checkmarkCount < this.competition.nombreSelection) {
      return this.NOT_ENOUGH;
    } else {
      return 1;
    }
  }

  initCompet(result) {
    const loading = this.loading.create({ content: "Chargement..." });
    loading.present();
    return this.db.get("competitions").then(competitions => {
      return this.db.get('criteria-list').then(criteria => {
        return this.db.get("components").then(components => {
          this.competition = _.find(competitions.list, { id: this.competId });

          // Assignation valeur jugement.
          if (this.competition) {
            switch (this.competition.judgingSystem) {
              case SYSTEM21:
                this.jugement = 'System 2.1';
                break;
              case SKATING:
                this.jugement = 'Skating';
                break;
              case SKATING_FINAL:
                this.jugement = 'Skating final';
                break;
            }
          }

          this.components = components.list.filter(component => {
            if (this.competition) {
              return component.competitions
                .indexOf(this.competition.type.id) != -1;
            }
          });

          // this.componentFilter = this.components.length ? this.components[0].identifier : null;
          this.componentFilter = this.DEFAULT_COMPONENT_ID;

          // Show only ten aliases if 2.1
          if (this.competition && this.competition.judgingSystem == SYSTEM21) {
            this.dossardsAliases = result.aliases.splice(0, 10);
            this.dossards = this.dossards.splice(0, 10);

            // Create the avgCriteriaScoreOfDos array based on dossards number
            this.avgsCriteriaScoreOfDos = this.dossards.map((_, idx) => {
              const dossardData = {};
              this.components.forEach(component => {
                dossardData[component.identifier] = {};
                criteria.list.forEach(crit => {
                  dossardData[component.identifier][crit.short] = this.avgCriteriaScoreOfDos(idx, crit.short, component.identifier);
                })
              });
              return dossardData
            });

            // Create the scoresPerComponentArr array based on dossards number
            this.scoresPerComponentArr = this.dossards.map((_, idx) => {
              const dossardData = {};
              this.components.forEach(component => {
                dossardData[component.identifier] = this.scoresPerComponent(idx, component.identifier);
              })
              return dossardData;
            });

            // Create the overAllScoresArr array based on dossards number
            this.overAllScoresArr = this.dossards.map((_, idx) => {
              return this.overallScore(idx);
            });

            // Create the rankOverallArr array based on dossards number
            this.rankOverallArr = this.dossards.map((_, idx) => {
              return this.rankOverall(idx);
            });
          }

          if (this.competition && this.competition.judgingSystem == SKATING) {
            this.dossardsAliases = result.aliases;

            // Create the scoresPerComponentSKArr array based on dossards number
            this.scoresPerComponentSKArr = this.dossards.map((_, idx) => {
              const dossardData = {};
              this.components.forEach(component => {
                dossardData[component.identifier] = this.scoresPerComponentSK(idx, component.identifier);
              })
              return dossardData;
            });

            // Create the overAllSKArr array based on dossards number
            this.overAllSKArr = this.dossards.map((_, idx) => {
              return this.overallScoreSK(idx);
            });

            // Create the rankOverallSKArr array based on dossards number
            this.rankOverallSKArr = this.dossards.map((_, idx) => {
              return this.rankOverallSK(idx);
            });
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

          loading.dismiss();

          return Promise.resolve(1);
        })
          .catch(e => console.log(e));
      })
        .catch(e => console.log(e))
    })
      .catch(e => console.log(e))
  }

  doRefresh(refresher) {
    this.db.update().then(() => {
      this.loadAll().then(() => {
        console.log('loaded');
        refresher.cancel()
      });
    })
  }

  /**
   * Nombre de feuille de component pour la
   * component spécifiée.
   * 
   * @param component
   */
  countJudgeSheetsOfComponent(component: string) {
    return this.judgeSheets.filter(sheet => {
      return sheet.component == component;
    }).length;
  }

  /**
   * Score global
   * 
   * @param dossardIndex
   */
  overallScore(dossardIndex) {
    let score: number = 0;

    this.components.forEach(component => {
      score += Number(this.scoresPerComponent(dossardIndex, component.identifier)) || 0;
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

    this.components.forEach(component => {
      score += Number(this.scoresPerComponentSK(dossardIndex, component.identifier)) || 0;
    });

    return _.round(score, 3);
  }

  /**
   * Rank overall
   * @param dossardIndex
   */
  rankOverallSK(dossardIndex) {
    const dossardsRanked = this.dossards.map((_, index) => {
      const dossardObj: any = {};
      dossardObj.score = this.overallScoreSK(index);
      dossardObj.id = index;
      return dossardObj;
    });

    const dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
  }


  /**
   * Rank overall
   * @param dossardIndex
   */
  rankOverall(dossardIndex) {
    const dossardsRanked = this.dossards.map((_, index) => {
      const dossardObj: any = {};
      dossardObj.score = this.overallScore(index);
      dossardObj.id = index;
      return dossardObj;
    });

    let dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");

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
            this.applyDeleteSheet(judgeSheet);
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
  applyDeleteSheet(judgeSheet) {
    this.db.get(judgeSheet._id).then(sheet => {
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
   * Rank per component of the dossard.
   */
  rankPerComponent(dossardIndex, componentFilter = this.componentFilter) {
    let dossardsRanked = this.dossards.map((_, index) => {
      let dossardObj: any = {};
      dossardObj.score = this.scoresPerComponent(index, componentFilter);
      dossardObj.component = componentFilter;
      dossardObj.id = index;
      return dossardObj;
    });

    let dossardsRanked_ordered = _.orderBy(dossardsRanked, "score", "desc");

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
  }

  /**
   * Score total par component pour un dossard
   * 
   * @param dossardIndex 
   * @param component 
   */
  scoresPerComponent(dossardIndex, componentFilter) {
    let scoresPerComponent: number = 0;
    this.criteria.forEach(criteria => {
      scoresPerComponent += Number(
        this.avgCriteriaScoreOfDos(dossardIndex, criteria, componentFilter)
      );
    });

    return _.round(scoresPerComponent, 3);
  }

  scoresPerComponentSK(dossardIndex, componentFilter = this.componentFilter) {
    let total: number = 0;

    if (this.judgeSheets.length) {
      let sheetsOfTheComponent: any = this.judgeSheets.filter(sheet => {
        return sheet.component == componentFilter;
      });
      if (sheetsOfTheComponent.length) {
        let scores = [];
        sheetsOfTheComponent.forEach(sheet => {
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
   * Moyenne d'une critere pour un dossard pour une component.
   */
  avgCriteriaScoreOfDos(dossardIndex: number, criteria: string, componentFilter = this.componentFilter) {
    try {

      let average: number = 0;
      if (this.judgeSheets.length) {
        // Les feuilles de juges pour la component en cours.
        let sheetsOfTheComponent: any = this.judgeSheets.filter(sheet => {
          return sheet.component == componentFilter;
        });
        // Récupération des scores du dossard pour la component en cours.
        if (sheetsOfTheComponent.length) {
          let scoresOfTheCriteria = [];
          sheetsOfTheComponent.forEach(sheet => {
            scoresOfTheCriteria.push(
              Number(sheet.dossards[Number(dossardIndex)][criteria]) || 0
            );
          })
          average = this.average(scoresOfTheCriteria);
        }
      }
      return _.round(average, 3);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Moyenne
   */
  average(scoresPerJudge: number[]) {
    let average: number = 0;
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

      average = numerator / (denominator);
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
      average = _.sum(sortedScores) / divider;
    }

    // return sortedScores.length;
    return _.round(average, 3);
  }

  /**
   * Logout
   */
  logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" })
  }

  inputChanged($ev, judgesheet, dosIdx, critere) {
    this.db.get(judgesheet._id).then(sheet => {
      sheet.dossards[dosIdx][critere] = parseFloat($ev.value);
      this.db.put(sheet).catch(e => {
        console.log(e)
      })
        .catch(e => {
          console.log(e);
        })
    })
  }

}