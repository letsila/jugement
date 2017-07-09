import { Component } from "@angular/core";
import { AlertController, IonicPage, NavController, PopoverController, ViewController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import { LoginPopover } from "../../popovers/login/login.popover";
import * as _ from "lodash";

@IonicPage()
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
  currentCompetition: any;

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

      // récupération de la compétition en cours
      this.db.get("competitions")
        .then(res => {
          console.log(res);
          if (localStorage.getItem("currentCompetitionId") == "") {
            let openCompetitions = res.list.filter(res => {
              return !res.closed;
            })

            if (openCompetitions.length) {
              localStorage.setItem("currentCompetitionId", openCompetitions[0].id)
            }
          }

          let competitionId = localStorage.getItem("currentCompetitionId");

          // Récupération des informations sur la compétition en cours
          console.log(res);
          this.currentCompetition = _.find(res.list, { id: competitionId });
        })
        .catch(e => {
          console.log(e);
        })

      this.db.get("danses")
        .then(res => {
          this.danses = res.list.filter(danse => {
            if (this.currentCompetition) {
              return danse.competitions.indexOf(this.currentCompetition.type.id) != -1;
            }
          });
          console.log(this.danses);
        })
        .catch(e => console.log(e));

      // Insertion des aliases de dossards.
      this.bootstrapData();
    })
  }

  /**
   * Display popover
   * @param myEvent 
   */
  public presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(LoginPopover, {
      dataTunnelFunc: () => {
        console.log("func");
        this.navCtrl.setRoot('ScrutationPage', {}, { animate: true, direction: "forward" })
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
    this.navCtrl.setRoot('JudgeSheetPage')
  }
}