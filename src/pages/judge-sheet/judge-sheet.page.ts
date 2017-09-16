import { Component, NgZone } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavController, IonicPage, ViewController } from 'ionic-angular';
import { DbService } from "../../services/db.service";
import { ScoreValidator } from '../../validators/score.validator';
import * as _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-sheet',
  templateUrl: 'judge-sheet.page.html'
})
export class JudgeSheetPage {
  criteria?: string[];
  dossardsAliases: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  judgeId: string;
  sheetId: string;
  judgeIdFilter: string;
  danse: string;
  dossards: any[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  dossards1: any[];
  dossards2: any[];
  competitionId = localStorage.getItem("currentCompetitionId");
  scoresForm: any;

  constructor(public navCtrl: NavController,
    public db: DbService,
    public viewCtrl: ViewController,
    public zone: NgZone,
    public formBuilder: FormBuilder
  ) {
  }

  get dossardsAliases1() {
    return this.dossardsAliases.slice().splice(0, 5)
  }

  get dossardsAliases2() {
    return this.dossardsAliases.slice().splice(5, 5)
  }

  ionViewDidLoad() {
    this.viewCtrl.didEnter.subscribe(() => {
      this.judgeId = localStorage.getItem("judgeId");
      this.danse = localStorage.getItem("danse");
      this.sheetId = "judge-sheet-" + this.judgeId + "-" +
        this.danse + "-" + this.competitionId;

      // Création de la feuille au niveau de la base
      // si celle ci n'existe pas encore.
      this.db.get(this.sheetId).then(res => {
        this.db.get('criteria-list').then(criteria => {
          this.db.get('competitions').then(competitions => {
            const competition = _.find(competitions.list, { id: this.competitionId });

            if (competition.type.criteria && competition.type.criteria.length) {
              this.criteria = criteria.list.filter(critere => {
                return competition.type.criteria.indexOf(critere.id) != -1;
              }).map(critere => {
                return critere.short;
              })
            }

            let groupInput = {};
            this.criteria.forEach(critere => {
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(alias => {
                groupInput[critere + alias] = ['', Validators.compose([Validators.maxLength(2), ScoreValidator.isValid])];
              })
            })

            this.scoresForm = this.formBuilder.group(groupInput);

            this.criteria.forEach(criteria => {
              res.dossards.forEach((dossard, index) => {
                this.dossards[index][criteria] = dossard[criteria];
              });
            });

            // Dossards aliases
            this.db.get("dossards").then(res => {
              this.dossardsAliases = res.aliases;
            })

          }).catch(e => console.log(e))
        }).catch(e => console.log(e))
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

  logout() {
    this.navCtrl.push('LoginPage', {}, { animate: true, direction: "back" });
    localStorage.setItem("role", "");
  }

  inputChanged() {
    this.db.get(this.sheetId).then(sheet => {
      this.criteria.forEach(critere => {
        this.dossards.forEach((dossard, index) => {
          if (!this.scoresForm.controls[critere + index].valid) {
            sheet.dossards[index][critere] = 0;
          } else {
            sheet.dossards[index][critere] = dossard[critere];
          }
        })
      })

      this.db.put(sheet)

    }).catch(e => {
      console.log(e);
    })
  }

}
