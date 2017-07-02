import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from "../login/login.page";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";

@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  public criteria: string[] = ["tq", "mm", "ps", "cp"];
  public dossardsAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  public dossardsAliases1: string[];
  public dossardsAliases2: string[];
  public judgeId: string;
  public sheetId: string;
  public judgeIdFilter: string;
  public danse: string;
  public dossards: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  public dossards1: any[];
  public dossards2: any[];

  constructor(public navCtrl: NavController,
    public db: DbService) {

  }

  ngOnInit() {
    // Always Sync 

    this.judgeId = localStorage.getItem("judgeId");
    this.danse = localStorage.getItem("danse");
    this.sheetId = "judge-sheet-" + this.judgeId + "-" + this.danse;

    // Création de la feuille au niveau de la base
    // si celle ci n'existe pas encore.
    this.db.get(this.sheetId).then(res => {
      this.criteria.forEach(criteria => {
        res.dossards.forEach((dossard, index) => {
          this.dossards[index][criteria] = dossard[criteria];
        });
      });

      // Dossards aliases
      this.db.get("dossards").then(res => {
        this.dossardsAliases = res.aliases;
        this.dossardsAliases1 = this.dossardsAliases.slice().splice(0, 5);
        this.dossardsAliases2 = this.dossardsAliases.slice().splice(5, 5);
      })
    })
      .catch(e => {
        if (e.name == "not_found" && this.judgeId) {
          this.db.put({
            _id: this.sheetId,
            judgeId: this.judgeId,
            danse: this.danse,
            dossards: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
          }).catch(e => {
            console.log(e);
          })
        }
      })
  }

  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" });
    localStorage.setItem("role", "");
  }

  public inputChanged() {
    console.log('changement');
    this.db.get(this.sheetId).then(sheet => {

      this.criteria.forEach(criteria => {
        this.dossards.forEach((dossard, index) => {
          sheet.dossards[index][criteria] = dossard[criteria];
        })
      })
      this.db.put(sheet)

    }).catch(e => {
      console.log(e);
    })
  }

}
