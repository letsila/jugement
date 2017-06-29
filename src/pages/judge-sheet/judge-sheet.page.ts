import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from "../login/login.page";
import { DbService } from "../../services/db.service";

@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  public judgeId: string;
  public sheetId: string;
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
    this.sheetId = "judge-sheet-" + this.judgeId;
    // Création de la feuille au niveau de la base
    // si celle ci n'existe pas encore.
    this.db.get(this.sheetId)
      .catch(e => {
        if (e.name == "not_found" && this.judgeId) {
          this.db.put({
            _id: this.sheetId,
            judgeId: this.judgeId
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
      sheet.dossard1TQ = this.dossard1TQ;
      sheet.dossard1MM = this.dossard1MM;
      sheet.dossard1PS = this.dossard1PS;
      sheet.dossard1CP = this.dossard1CP;

      sheet.dossard2TQ = this.dossard2TQ;
      sheet.dossard2MM = this.dossard2MM;
      sheet.dossard2PS = this.dossard2PS;
      sheet.dossard2CP = this.dossard2CP;

      sheet.dossard3TQ = this.dossard3TQ;
      sheet.dossard3MM = this.dossard3MM;
      sheet.dossard3PS = this.dossard3PS;
      sheet.dossard3CP = this.dossard3CP;

      sheet.dossard4TQ = this.dossard4TQ;
      sheet.dossard4MM = this.dossard4MM;
      sheet.dossard4PS = this.dossard4PS;
      sheet.dossard4CP = this.dossard4CP;

      sheet.dossard5TQ = this.dossard5TQ;
      sheet.dossard5MM = this.dossard5MM;
      sheet.dossard5PS = this.dossard5PS;
      sheet.dossard5CP = this.dossard5CP;

      sheet.dossard6TQ = this.dossard6TQ;
      sheet.dossard6MM = this.dossard6MM;
      sheet.dossard6PS = this.dossard6PS;
      sheet.dossard6CP = this.dossard6CP;

      sheet.dossard7TQ = this.dossard7TQ;
      sheet.dossard7MM = this.dossard7MM;
      sheet.dossard7PS = this.dossard7PS;
      sheet.dossard7CP = this.dossard7CP;

      sheet.dossard8TQ = this.dossard8TQ;
      sheet.dossard8MM = this.dossard8MM;
      sheet.dossard8PS = this.dossard8PS;
      sheet.dossard8CP = this.dossard8CP;

      sheet.dossard9TQ = this.dossard9TQ;
      sheet.dossard9MM = this.dossard9MM;
      sheet.dossard9PS = this.dossard9PS;
      sheet.dossard9CP = this.dossard9CP;

      sheet.dossard10TQ = this.dossard10TQ;
      sheet.dossard10MM = this.dossard10MM;
      sheet.dossard10PS = this.dossard10PS;
      sheet.dossard10CP = this.dossard10CP;

      this.db.put(sheet)

    }).catch(e => {
      console.log(e);
    })
  }

}
