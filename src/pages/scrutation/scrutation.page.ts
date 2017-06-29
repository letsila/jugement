import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { LoginPage } from "../login/login.page";
import { DbService } from "../../services/db.service";

@Component({
  selector: "page-scrutation",
  templateUrl: "scrutation.page.html"
})
export class ScrutationPage {
  public judgeSheets: any[];
  public judgeId: string;

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
      }).catch(e => {
        console.log(e);
      })
  }

  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" })
  }


}