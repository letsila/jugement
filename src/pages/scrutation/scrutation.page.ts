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
    console.log(dossardsRanked_ordered);

    return _.findIndex(dossardsRanked_ordered, { id: dossardIndex }) + 1;
  }

  /**
   * Score total par danse pour un dossard
   * 
   * @param dossardIndex 
   * @param danse 
   */
  public scoresPerDanse(dossardIndex, danse) {
    let scoresPerDanse = 0;
    ["tq", "mm", "ps", "cp"].forEach(criteria => {
      scoresPerDanse += this.meanCriteriaScoreOfDossardId(dossardIndex, danse, criteria);
    });

    return scoresPerDanse;
  }

  /**
   * Moyenne d'une critere pour un dossard pour une danse.
   */
  public meanCriteriaScoreOfDossardId(dossardIndex: number, danse: string, criteria: string) {
    try {

      let mean = 0;

      if (this.judgeSheets.length) {
        // Les feuilles de juges pour la danse en cours.
        let sheetsOfTheDanse: any = this.judgeSheets.filter(sheet => {
          return sheet.danse == danse;
        });


        // Récupération des scores du dossard pour la danse en cours.
        if (sheetsOfTheDanse.length) {
          let scoresOfTheCriteria = [];
          sheetsOfTheDanse.forEach(sheet => {
            scoresOfTheCriteria.push(sheet.dossards[dossardIndex][criteria] || 0);
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
    let mean = 0;
    let sortedScores = scoresPerJudge.sort();
    if (sortedScores.length >= 2) {
      sortedScores[0] *= 0.5;
      sortedScores[1] *= 0.5;
      mean = _.sum(sortedScores) / (sortedScores.length - 1);
    } else if (sortedScores.length == 1) {
      mean = _.mean(sortedScores);
    }

    return mean;
  }

  /**
   * Logout
   */
  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" })
  }


}