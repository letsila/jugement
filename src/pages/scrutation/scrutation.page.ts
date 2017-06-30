import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { LoginPage } from "../login/login.page";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";

@Component({
  selector: "page-scrutation",
  templateUrl: "scrutation.page.html"
})
export class ScrutationPage {
  public dossards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public judgeSheets: any[] = [];
  public judgeId: string;
  public danseFilter: string = "chacha";
  public danses = ["chacha", "rumba", "jive", "passo", "samba"];
  public criteria = ["tq", "mm", "ps", "cp"];

  constructor(
    public navCtrl: NavController,
    public db: DbService
  ) {

  }

  ngOnInit() {
    this.db.allDocs()
      .then(res => {
        console.log(res);

        this.judgeSheets = res.rows.map(sheet => {
          return sheet.doc;
        });

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
  public countJudgeSheetsOfDanse(danse: string) {
    return this.judgeSheets.filter(sheet => {
      return sheet.danse == danse;
    }).length;
  }

  /**
   * Score global
   * 
   * @param dossardIndex
   */
  public overallScore(dossardIndex) {
    let score: number = 0;
    this.danses.forEach(danse => {
      score += Number(this.scoresPerDanse(dossardIndex, danse)) || 0;
    });
    
    return score;
  }

  /**
   * Rank overall
   * @param dossardIndex
   */
  public rankOverall(dossardIndex) {

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
   * Rank per danse of the dossard.
   */
  public rankPerDanse(dossardIndex, danse) {
    let dossardsRanked = this.dossards.map((dossard, index) => {
      let dossardObj: any = {};
      dossardObj.score = this.scoresPerDanse(index, danse);
      dossardObj.danse = danse;
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
  public scoresPerDanse(dossardIndex, danse) {
    let scoresPerDanse: number = 0;
    this.criteria.forEach(criteria => {
      scoresPerDanse += Number(this.meanCriteriaScoreOfDossardId(dossardIndex, danse, criteria));
    });

    return scoresPerDanse;
  }

  /**
   * Moyenne d'une critere pour un dossard pour une danse.
   */
  public meanCriteriaScoreOfDossardId(dossardIndex: number, danse: string, criteria: string) {
    try {

      let mean: number = 0;

      if (this.judgeSheets.length) {
        // Les feuilles de juges pour la danse en cours.
        let sheetsOfTheDanse: any = this.judgeSheets.filter(sheet => {
          return sheet.danse == danse;
        });
        // Récupération des scores du dossard pour la danse en cours.
        if (sheetsOfTheDanse.length) {
          let scoresOfTheCriteria = [];
          sheetsOfTheDanse.forEach(sheet => {
            scoresOfTheCriteria.push(sheet.dossards[Number(dossardIndex)][criteria] || 0);
            scoresOfTheCriteria = scoresOfTheCriteria.map(el => Number(el));
          })
          mean = this.mean(scoresOfTheCriteria);
        }
      }

      return mean;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Moyenne
   */
  public mean(scoresPerJudge: number[]) {
    let mean: number = 0;
    // console.log(sortedScores);
    let sortedScores = scoresPerJudge.sort();
    sortedScores = sortedScores.map((val, index) => {
      if (index == 0 || index == _.lastIndexOf(sortedScores)) {
        return val * 0.5;
      }
      return val;
    })
    mean = _.sum(sortedScores) / (sortedScores.length - 1);

    return mean;
  }

  /**
   * Logout
   */
  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" })
  }


}