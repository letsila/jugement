import { Component } from "@angular/core";
import { AlertController, NavController, PopoverController, ViewController } from "ionic-angular";
import { JudgeSheetPage } from "../judge-sheet/judge-sheet.page";
import { ScrutationPage } from "../scrutation/scrutation.page";
import { DbService } from "../../services/db.service";
import { LoginPopover } from "../../popovers/login/login.popover";

@Component({
  selector: "page-login",
  templateUrl: "login.page.html",
})
export class LoginPage {

  public danseSelected: string = "chacha";
  public danses: any[];
  public judgeId: string;
  public loginCheck: string;
  public mdpCheck: string;

  constructor(
    public db: DbService,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.viewCtrl.didEnter.subscribe(() => {
      this.judgeId = localStorage.getItem("judgeId");
    })

    this.db.get("danses")
      .then(res => {
        this.danses = res.list;
        console.log(this.danses);
      })
      .catch(e => console.log(e));

    // Insertion des aliases de dossards.
    this.bootstrapData();
  }

  /**
   * Display popover
   * @param myEvent 
   */
  public presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(LoginPopover, {
      dataTunnelFunc: () => {
        console.log("func");
        this.navCtrl.setRoot(ScrutationPage, {}, { animate: true, direction: "forward" })
      }
    });
    popover.present();
  }

  public bootstrapData() {
    this.db.get("dossards")
      .catch(e => {
        if (e.name == "not_found") {
          this.db.put({
            _id: "dossards",
            aliases: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
          })
        }
      });
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