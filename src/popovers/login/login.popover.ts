import { Component } from "@angular/core";
import { AlertController, NavController, NavParams, ViewController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import * as _ from "lodash";

@Component({
  selector: "popover-login",
  templateUrl: "login.popover.html"
})
export class LoginPopover {
  public login: string = "";
  public password: string = "";

  public dataTunnelFunc: any = this.navParams.get("dataTunnelFunc");
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public db: DbService) {

  }

  /**
   * Connexion en tant que scrutateur.
   */
  public connectScrutateur() {
    console.log(this.login);
    console.log(this.password);

    this.db.get("credentials").then(res => {
      let user = _.find(res.users, { login: this.login, password: this.password });

      if (user) {
        localStorage.setItem("role", "scrutateur");
        localStorage.setItem("login", this.login);

        this.dataTunnelFunc();
        this.viewCtrl.dismiss();
      } else {
        this.alertCtrl.create({
          title: 'Erreur de connexion',
          subTitle: 'Login/Mot de passe incorrect',
          buttons: ['Fermer']
        })
          .present();
      }
    }).catch(e => {
      console.log(e);
    })
  }
}