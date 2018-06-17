import { Component } from "@angular/core";
import { AlertController, Platform, IonicPage, MenuController, NavController, PopoverController, ViewController } from "ionic-angular";
import { DbService } from "../../services/db.service";
import { LoginPopover } from "../../popovers/login/login.popover";
import { ScoreValidator } from '../../validators/score.validator';
import { FormBuilder, Validators } from '@angular/forms';
import { HelperService } from '../../services/helper.service';
import * as _ from "lodash";


declare let navigator: any;
declare let Connection: any;

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
  competitionId: string;

  constructor(
    public db: DbService,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    public helper: HelperService,
    public platform: Platform,
    public menu: MenuController,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController) {

    menu.swipeEnable(false, 'menu');
  }

  ngOnInit() {
    this.judgeId = localStorage.getItem("judgeId");

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

        let competitionId = this.competitionId = localStorage.getItem("currentCompetitionId");

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
        this.navCtrl.setRoot('ScrutationPage', {});
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

    // Important !!!
    // La construction du formGroup dans la partie onInit() du judge-sheet provoque
    // un bug car les clé des critères de validation sont requises dans au moment
    // de l'instanciation du component. Nous les préchargeons donc dans cette page
    // afin de passer ces valeurs dans le constructeur.
    this.db.get('criteria-list').then(criteria => {
      this.db.get('competitions').then(competitions => {
        const competition = _.find(competitions.list, { id: this.competitionId });

        let theCriteria;
        let criteriaLongObj;
        if (competition.type.criteria && competition.type.criteria.length) {
          criteriaLongObj = criteria.list.filter(critere => {
            return competition.type.criteria.indexOf(critere.id) != -1;
          })

          theCriteria = criteriaLongObj.map(critere => {
            return critere.short;
          })
        }

        let groupInput = {};
        theCriteria.forEach(critere => {
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(alias => {
            groupInput[critere + alias] = ['', Validators.compose([Validators.maxLength(3), ScoreValidator.isValid])];
          })
        })

        let scoresForm = this.formBuilder.group(groupInput);

        this.navCtrl.push('JudgeSheetPage', {
          criteria: theCriteria,
          scoresForm,
          criteriaLongObj,
          currentCompetition: this.currentCompetition
        })

      }).catch(e => console.log(e))
    }).catch(e => console.log(e))

  }

  /**
   * Synchronise pouchdb : récupération de catalogue et envoie de sessions de ventes.
   */
  public async sync() {
    const loading = this.helper.getLoading();
    loading.present();

    const noInternetTxt = "Erreur internet";
    const noInternetMsg = "Vous n'êtes pas connectés au réseau!";
    const catalogDownloadErrorMsg = "Erreur de téléchargement"
    const pouchdbSyncedSuccessMsg = "Votre base de données est à jour";

    if (
      this.platform.is('cordova') &&
      navigator.connection.type == Connection.NONE
    ) {
      this.alertCtrl.create({
        title: noInternetTxt,
        subTitle: noInternetMsg,
        buttons: ['Fermer']
      })
        .present();
      loading.dismiss();
    } else {
      this.db
        .replicateToRemote(false)
        .on('error', () => {
          console.log('error');
        })
        .on('complete', () => {
          console.log('replicateToRemote');
          this.db
            .replicateFromRemote(false)
            .on('denied', err => {
              loading.dismiss();
              this.alertCtrl.create({
                title: 'Erreur !',
                subTitle: catalogDownloadErrorMsg,
                buttons: ['Fermer']
              })
                .present();
              console.log(err);
            })
            .on('complete', err => {
              loading.dismiss();
              this.alertCtrl.create({
                title: 'Synchronisé !',
                subTitle: pouchdbSyncedSuccessMsg,
                buttons: ['Fermer']
              })
                .present();
            })
            .on('error', e => {
              loading.dismiss();
              this.alertCtrl.create({
                title: 'OOPS ...',
                subTitle: catalogDownloadErrorMsg,
                buttons: ['Fermer']
              })
                .present();
              console.error(e);
            })
            .catch(e => {
              console.error(e);
            });
        });
    }
  }
}