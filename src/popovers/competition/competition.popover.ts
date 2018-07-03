import { Component } from "@angular/core";
import { NavParams, NavController, ViewController } from "ionic-angular";
import { DbService } from "../../services/db.service";

@Component({
  selector: "popover-competition",
  templateUrl: "competition.popover.html"
})
export class CompetitionPopover {

  sendDataToCaller = this.navParams.get("dataTunnelFunc");
  competitionTypeId: number = 1;
  competitionTitre: string = "";
  submitAttempted: boolean;

  competitionsType: any[] = [];
  judgingSystemId: number = 1;
  judgingSystems = [
    {
      id: 1,
      name: "System 2.1"
    },
    {
      id: 2,
      name: "Skating system"
    },
    {
      id: 3,
      name: "Skating system final"
    }
  ];

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public db: DbService) {
  }

  ngOnInit() {
    this.db.get("competitions-type")
      .then(res => {
        this.competitionsType = res.list;
      }).catch(e => {
        console.log(e);
      })
  }

  addCompetition(competitionForm) {
    this.submitAttempted = true;

    if (competitionForm.valid) {
      this.sendDataToCaller(this.competitionTitre, this.competitionTypeId, this.judgingSystemId);
      this.viewCtrl.dismiss();
    }
  }
}