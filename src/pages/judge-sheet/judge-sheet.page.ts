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
  public judgeId: string;
  public sheetId: string;
  public judgeIdFilter: string;
  public danse: string;

  public dossard1TQ: number;
  public dossard1MM: number;
  public dossard1PS: number;
  public dossard1CP: number;

  public dossard2TQ: number;
  public dossard2MM: number;
  public dossard2PS: number;
  public dossard2CP: number;

  public dossard3TQ: number;
  public dossard3MM: number;
  public dossard3PS: number;
  public dossard3CP: number;

  public dossard4TQ: number;
  public dossard4MM: number;
  public dossard4PS: number;
  public dossard4CP: number;

  public dossard6TQ: number;
  public dossard6MM: number;
  public dossard6PS: number;
  public dossard6CP: number;

  public dossard5TQ: number;
  public dossard5MM: number;
  public dossard5PS: number;
  public dossard5CP: number;

  public dossard7TQ: number;
  public dossard7MM: number;
  public dossard7PS: number;
  public dossard7CP: number;

  public dossard8TQ: number;
  public dossard8MM: number;
  public dossard8PS: number;
  public dossard8CP: number;

  public dossard9TQ: number;
  public dossard9MM: number;
  public dossard9PS: number;
  public dossard9CP: number;

  public dossard10TQ: number;
  public dossard10MM: number;
  public dossard10PS: number;
  public dossard10CP: number;

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
      this.dossard1TQ = res.dossards[0].tq;
      this.dossard1MM = res.dossards[0].mm;
      this.dossard1PS = res.dossards[0].ps;
      this.dossard1CP = res.dossards[0].cp;

      this.dossard2TQ = res.dossards[1].tq;
      this.dossard2MM = res.dossards[1].mm;
      this.dossard2PS = res.dossards[1].ps;
      this.dossard2CP = res.dossards[1].cp;

      this.dossard3TQ = res.dossards[2].tq;
      this.dossard3MM = res.dossards[2].mm;
      this.dossard3PS = res.dossards[2].ps;
      this.dossard3CP = res.dossards[2].cp;

      this.dossard4TQ = res.dossards[3].tq;
      this.dossard4MM = res.dossards[3].mm;
      this.dossard4PS = res.dossards[3].ps;
      this.dossard4CP = res.dossards[3].cp;

      this.dossard5TQ = res.dossards[4].tq;
      this.dossard5MM = res.dossards[4].mm;
      this.dossard5PS = res.dossards[4].ps;
      this.dossard5CP = res.dossards[4].cp;

      this.dossard6TQ = res.dossards[5].tq;
      this.dossard6MM = res.dossards[5].mm;
      this.dossard6PS = res.dossards[5].ps;
      this.dossard6CP = res.dossards[5].cp;

      this.dossard7TQ = res.dossards[6].tq;
      this.dossard7MM = res.dossards[6].mm;
      this.dossard7PS = res.dossards[6].ps;
      this.dossard7CP = res.dossards[6].cp;

      this.dossard8TQ = res.dossards[7].tq;
      this.dossard8MM = res.dossards[7].mm;
      this.dossard8PS = res.dossards[7].ps;
      this.dossard8CP = res.dossards[7].cp;

      this.dossard9TQ = res.dossards[8].tq;
      this.dossard9MM = res.dossards[8].mm;
      this.dossard9PS = res.dossards[8].ps;
      this.dossard9CP = res.dossards[8].cp;

      this.dossard10TQ = res.dossards[9].tq;
      this.dossard10MM = res.dossards[9].mm;
      this.dossard10PS = res.dossards[9].ps;
      this.dossard10CP = res.dossards[9].cp;
    })
      .catch(e => {
        if (e.name == "not_found" && this.judgeId) {
          this.db.put({
            _id: this.sheetId,
            judgeId: this.judgeId,
            danse: this.danse,
            dossards: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
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
      sheet.dossards[0].tq = this.dossard1TQ;
      sheet.dossards[0].mm = this.dossard1MM;
      sheet.dossards[0].ps = this.dossard1PS;
      sheet.dossards[0].cp = this.dossard1CP;

      sheet.dossards[1].tq = this.dossard2TQ;
      sheet.dossards[1].mm = this.dossard2MM;
      sheet.dossards[1].ps = this.dossard2PS;
      sheet.dossards[1].cp = this.dossard2CP;

      sheet.dossards[2].tq = this.dossard3TQ;
      sheet.dossards[2].mm = this.dossard3MM;
      sheet.dossards[2].ps = this.dossard3PS;
      sheet.dossards[2].cp = this.dossard3CP;

      sheet.dossards[3].tq = this.dossard4TQ;
      sheet.dossards[3].mm = this.dossard4MM;
      sheet.dossards[3].ps = this.dossard4PS;
      sheet.dossards[3].cp = this.dossard4CP;

      sheet.dossards[4].tq = this.dossard5TQ;
      sheet.dossards[4].mm = this.dossard5MM;
      sheet.dossards[4].ps = this.dossard5PS;
      sheet.dossards[4].cp = this.dossard5CP;

      sheet.dossards[5].tq = this.dossard6TQ;
      sheet.dossards[5].mm = this.dossard6MM;
      sheet.dossards[5].ps = this.dossard6PS;
      sheet.dossards[5].cp = this.dossard6CP;

      sheet.dossards[6].tq = this.dossard7TQ;
      sheet.dossards[6].mm = this.dossard7MM;
      sheet.dossards[6].ps = this.dossard7PS;
      sheet.dossards[6].cp = this.dossard7CP;

      sheet.dossards[7].tq = this.dossard8TQ;
      sheet.dossards[7].mm = this.dossard8MM;
      sheet.dossards[7].ps = this.dossard8PS;
      sheet.dossards[7].cp = this.dossard8CP;

      sheet.dossards[8].tq = this.dossard9TQ;
      sheet.dossards[8].mm = this.dossard9MM;
      sheet.dossards[8].ps = this.dossard9PS;
      sheet.dossards[8].cp = this.dossard9CP;

      sheet.dossards[9].tq = this.dossard10TQ;
      sheet.dossards[9].mm = this.dossard10MM;
      sheet.dossards[9].ps = this.dossard10PS;
      sheet.dossards[9].cp = this.dossard10CP;

      this.db.put(sheet)

    }).catch(e => {
      console.log(e);
    })
  }

}
