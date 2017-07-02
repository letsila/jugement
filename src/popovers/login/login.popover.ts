import { Component } from "@angular/core";
import { AlertController, NavController, NavParams, ViewController } from "ionic-angular";
import { ScrutationPage } from "../../pages/scrutation/scrutation.page";

@Component({
  selector: "popover-login",
  templateUrl: "login.popover.html"
})
export class LoginPopover {
  public login: string = "mpitsara@tcmd.com";
  public password: string = "judgeDred";
  
  public dataTunnelFunc: any = this.navParams.get("dataTunnelFunc");
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController) {

  }

  /**
   * Connexion en tant que scrutateur.
   */
  public connectScrutateur() {
    console.log(this.login);
    console.log(this.password);
    console.log(localStorage.getItem("loginCheck"));



    if (this.login == localStorage.getItem("loginCheck") && this.password == localStorage.getItem("mdpCheck")) {
      localStorage.setItem("role", "scrutateur");
      console.log(localStorage.getItem("role"));

      this.dataTunnelFunc();
      this.viewCtrl.dismiss();

    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Erreur de connexion',
        subTitle: 'Login/Mot de passe incorrect',
        buttons: ['Fermer']
      });
      alert.present();
    }
  }
}