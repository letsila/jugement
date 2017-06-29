import { Component } from "@angular/core";
import { NavController, AlertController } from "ionic-angular";
import { JudgeSheetPage } from "../judge-sheet/judge-sheet.page";
import { ScrutationPage } from "../scrutation/scrutation.page";

@Component({
  selector: "page-login",
  templateUrl: "login.page.html",
})
export class LoginPage {
  public login: string;
  public password: string;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController) {
  }

  /**
   * Connexion en tant que scrutateur.
   */
  public connectScrutateur() {
    if (this.login == "scrutateur" && this.password == "scrutateur") {
      localStorage.setItem("role", "scrutateur");
      this.navCtrl.setRoot(ScrutationPage, {}, { animate: true, direction: "forward" });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Erreur de connexion',
        subTitle: 'Login/Mot de passe incorrect',
        buttons: ['Fermer']
      });
      alert.present();
    }

  }

  /**
   * Connexion en tant que juge
   */
  public connectJuge() {
    localStorage.setItem("role", "juge");
    this.navCtrl.setRoot(JudgeSheetPage)
  }
}