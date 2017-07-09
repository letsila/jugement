import { Component, NgZone } from '@angular/core';
import { NavController, IonicPage, ViewController } from 'ionic-angular';
import { DbService } from "../../services/db.service";

@IonicPage()
@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  public criteria: string[] = ["tq", "mm", "ps", "cp"];
  public dossardsAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  public judgeId: string;
  public sheetId: string;
  public judgeIdFilter: string;
  public danse: string;
  public dossards: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  public dossards1: any[];
  public dossards2: any[];
  public competitionId = localStorage.getItem("currentCompetitionId");

  constructor(public navCtrl: NavController,
    public db: DbService,
    public viewCtrl: ViewController,
    public zone: NgZone) {

  }

  get dossardsAliases1() {
    return this.dossardsAliases.slice().splice(0, 5)
  }

  get dossardsAliases2() {
    return this.dossardsAliases.slice().splice(5, 5)
  }


  ngOnInit() {
    this.viewCtrl.didEnter.subscribe(() => {

      // Always Sync 

      this.judgeId = localStorage.getItem("judgeId");
      this.danse = localStorage.getItem("danse");
      this.sheetId = "judge-sheet-" + this.judgeId + "-" +
        this.danse + "-" + localStorage.getItem("currentCompetitionId");

      // Création de la feuille au niveau de la base
      // si celle ci n'existe pas encore.
      this.db.get(this.sheetId).then(res => {
        this.criteria.forEach(criteria => {
          res.dossards.forEach((dossard, index) => {
            this.dossards[index][criteria] = dossard[criteria];
          });
        });

        // this.zone.run(() => {
          // Dossards aliases
          this.db.get("dossards").then(res => {
            this.dossardsAliases = res.aliases;
          })
        // })
      })
        .catch(e => {
          if (e.name == "not_found" && this.judgeId) {
            this.db.put({
              _id: this.sheetId,
              judgeId: this.judgeId,
              danse: this.danse,
              competitionId: this.competitionId,
              dossards: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
            }).catch(e => {
              console.log(e);
            })
          }
        })
    })
  }

  public logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" });
    localStorage.setItem("role", "");
  }

  public inputChanged() {
    console.log('changement');
    this.db.get(this.sheetId).then(sheet => {

      this.criteria.forEach(criteria => {
        this.dossards.forEach((dossard, index) => {
          sheet.dossards[index][criteria] = dossard[criteria];
        })
      })
      this.db.put(sheet)

    }).catch(e => {
      console.log(e);
    })
  }

}
