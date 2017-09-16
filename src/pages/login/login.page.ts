import { Component } from "@angular/core";
import { AlertController, IonicPage, MenuController, NavController, PopoverController, ViewController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import { LoginPopover } from "../../popovers/login/login.popover";
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.page.html",
})
export class LoginPage {

  danseSelected: string;
  danses: any[];
  judgeId: string;
  loginCheck: string;
  mdpCheck: string;
  currentCompetition: any;

  constructor(
    public db: DbService,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    public menu: MenuController,
    public alertCtrl: AlertController) {

    menu.swipeEnable(false, 'menu');
  }

  ngOnInit() {
    this.judgeId = localStorage.getItem("judgeId");

    // récupération de la compétition en cours
    this.db.get("competitions")
      .then(res => {
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
        this.currentCompetition = _.find(res.list, { id: competitionId });

        this.db.get("danses")
          .then(res => {
            this.danses = res.list.filter(danse => {
              if (this.currentCompetition) {
                return danse.competitions.indexOf(this.currentCompetition.type.id) != -1;
              }
            });
          })
          .catch(e => console.log(e));
      })
      .catch(e => {
        console.log(e);
      })

    // Insertion des aliases de dossards.
    this.bootstrapData();
  }

  /**
   * Display popover
   * @param myEvent 
   */
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(LoginPopover, {
      dataTunnelFunc: () => {
        this.navCtrl.setRoot('ScrutationPage', {}, { animate: true, direction: "forward" })
      }
    });
    popover.present();
  }

  bootstrapData() {
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
  connectJuge() {
    localStorage.setItem("role", "juge");
    localStorage.setItem("danse", this.danseSelected);

    if (!this.danseSelected) {
      this.alertCtrl.create({
        title: 'Erreur !',
        subTitle: 'Vous n\'avez pas selectionné de danse à juger',
        buttons: ['Fermer']
      })
        .present();
      return;
    }
    this.navCtrl.setRoot('JudgeSheetPage')
  }
}