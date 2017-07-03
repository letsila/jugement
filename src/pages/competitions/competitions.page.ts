import { Component } from "@angular/core";
import { DbService } from "../../services/db.service";
import { AlertController, NavController, PopoverController } from "ionic-angular";
import { CompetitionPopover } from "../../popovers/competition/competition.popover";
import { LoginPage } from "../../pages/login/login.page";
import * as _ from "lodash";

@Component({
  selector: "page-competitions",
  templateUrl: "competitions.page.html"
})
export class CompetitionsPage {
  public closedCompetitions: any[] = [];
  public openCompetitions: any[] = [];
  public currentCompetitionId: string;
  public competitionsType: any[];

  constructor(
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    public db: DbService,
    public alertCtrl: AlertController) {
  }

  ionViewWillLeave() {
    localStorage.setItem("currentCompetitionId", this.currentCompetitionId);
    console.log(localStorage.getItem("currentCompetitionId"));
  }

  ngOnInit() {
    this.currentCompetitionId = localStorage.getItem("currentCompetitionId");

    console.log(this.currentCompetitionId);

    this.loadCompetitions();

    this.db.get("competitions-type")
      .then(res => {
        this.competitionsType = res.list;
      })
      .catch(e => {
        console.log(e)
      })
  }

  loadCompetitions() {
    this.db.get("competitions")
      .then(res => {
        console.log(res);
        this.closedCompetitions = res.list.filter(compet => {
          return compet.closed;
        });
        this.openCompetitions = res.list.filter(compet => {
          return !compet.closed;
        });
      })
      .catch(e => {
        console.log(e);
      })
  }

  closeCompetition(competition, index) {
    let confirmation = this.alertCtrl.create({
      title: "Clôture",
      message: "Une fois clôturer cette compétition ne pourra plus être modifiée",
      buttons: [
        {
          text: "Clôturer",
          handler: () => {
            this.applyCloture(competition, index)
          }
        },
        {
          text: "Annuler",
          handler: () => {

          }
        }
      ]
    });

    confirmation.present();
  }

  applyCloture(competition, index) {
    console.log(competition);
    this.db.get("competitions").then(res => {
      const competIndex = _.findIndex(res.list, { id: competition.id })
      res.list[competIndex].closed = true;
      res.list[competIndex].date_cloture = Date.now();

      this.db.put(res).then(() => {
        this.loadCompetitions();
      })
    })
      .catch(e => console.log(e))
  }

  deleteCompetition(competition, index) {

    let alert = this.alertCtrl.create({
      title: "Suppression competition",
      message: "Voulez-vous vraiment supprimer cette compétition",
      buttons: [
        {
          text: "Oui",
          handler: () => {
            this.applyDelete(competition, index);
          }
        },
        {
          text: "Non",
          handler: () => {

          }
        }]
    })

    alert.present();
  }

  applyDelete(competition, index) {
    this.db.get("competitions")
      .then(res => {
        let competIndex = _.findIndex(res.list, { id: competition.id });
        res.list.splice(competIndex, 1);

        // Suppression de toutes les feuilles rattachées à la competitions
        this.db.getJudgeSheetOfCompetition(competition.id)
          .then(sheets => {
            console.log(sheets.rows);
            let sheetsToDelete = sheets.rows.map(sheetDoc => {
              return sheetDoc.doc;
            }).map(sheet => {
              sheet._deleted = true;
              return sheet;
            })

            console.log(sheetsToDelete);

            this.db.bulkDocs(sheetsToDelete).then(() => {
              // suppression de la competition
              this.db.put(res).then(() => {
                this.openCompetitions.splice(index, 1);

                if (localStorage.getItem("currentCompetitionId") == competition.id) {
                  localStorage.setItem("currentCompetitionId", "");
                }
              });
            })
              .catch(e => console.log(e));
          }).catch(e => {
            console.log(e);
          })
      })
      .catch(e => { console.log(e) });
  }

  openAddCompetitionPopover() {
    let newCompetitionPopover = this.popoverCtrl.create(CompetitionPopover, {
      dataTunnelFunc: (competitionTitre, competitionType) => {
        this.saveNewCompetition(competitionTitre, competitionType);
      }
    })

    newCompetitionPopover.present();
  }

  saveNewCompetition(competitionTitre, competitionType) {
    let competitionTypeObj = _.find(this.competitionsType, { id: Number(competitionType) });
    console.log(competitionTypeObj);
    let newCompet = {
      id: "compet-" + Date.now(),
      type: competitionTypeObj,
      titre: competitionTitre,
      closed: false,
      date: Date.now()
    };

    this.db.get("competitions")
      .then(res => {
        res.list.push(newCompet);

        this.db.put(res).then(res => {
          this.openCompetitions.push(newCompet);
        })
      })
      .catch(e => {
        console.log(e);
      })
  }

  logout() {
    this.navCtrl.push(LoginPage, {}, { animate: true, direction: "back" })
  }

}