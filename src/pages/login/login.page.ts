import { Component } from "@angular/core";
import { NavController, AlertController } from "ionic-angular";
import { JudgeSheetPage } from "../judge-sheet/judge-sheet.page";
import { ScrutationPage } from "../scrutation/scrutation.page";
import { DbService } from "../../services/db.service";

@Component({
  selector: "page-login",
  templateUrl: "login.page.html",
})
export class LoginPage {
  public login: string;
  public password: string;
  public danseSelected: string = "chacha";
  public danses: any[];

  constructor(
    public db: DbService,
    public navCtrl: NavController,
    public alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.db.get("danses")
    .then(res => {
      this.danses = res.list;
      console.log(this.danses);
    })
    .catch(e => console.log(e));
  }

  /**
   * Connexion en tant que scrutateur.
   */
  public connectScrutateur() {
    console.log(this.login);
    console.log(this.password);

    // if (this.login == "scrutateur" && this.password == "scrutateur") {
    if (true) {
      localStorage.setItem("role", "scrutateur");
      console.log(localStorage.getItem("role"));
      this.navCtrl.setRoot(ScrutationPage, {}, { animate: true, direction: "forward" });
    }
    // else {
    //   let alert = this.alertCtrl.create({
    //     title: 'Erreur de connexion',
    //     subTitle: 'Login/Mot de passe incorrect',
    //     buttons: ['Fermer']
    //   });
    //   alert.present();
    // }

  }

  /**
   * Connexion en tant que juge
   */
  public connectJuge() {
    localStorage.setItem("role", "juge");
    localStorage.setItem("danse", this.danseSelected);
    this.navCtrl.setRoot(JudgeSheetPage)
  }
}