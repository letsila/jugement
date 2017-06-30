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
  public judgeSheets: any[];
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

  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" })
  }


}