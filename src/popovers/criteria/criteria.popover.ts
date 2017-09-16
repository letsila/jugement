import { Component } from "@angular/core";
import { NavParams, NavController, ViewController } from "ionic-angular";
import { DbService } from "../../services/db.service";

@Component({
  selector: "popover-criteria",
  templateUrl: "criteria.popover.html"
})
export class CriteriaPopover {

  sendDataToCaller = this.navParams.get("dataTunnelFunc");

  constructor(
    public navParams: NavParams
  ) {
  }

  saveCriteriaOfType(id) {
    
  }

}