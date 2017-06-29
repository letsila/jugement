import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { LoginPage } from "../login/login.page";

@Component({
  selector: "page-scrutation",
  templateUrl: "scrutation.page.html"
})
export class ScrutationPage {
  constructor(
    public navCtrl: NavController
  ) {

  }

  public logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back"})
  }

  
}