import { Component } from '@angular/core';
import { IonicPage, AlertController } from 'ionic-angular';
import { DbService } from '../../services/db.service';
import * as _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-types',
  templateUrl: 'types.page.html'
})
export class TypesPage {
  types: any = [];
  newTypeName: string = '';

  constructor(
    public db: DbService,
    public alertCtrl: AlertController
  ) {
  }

  ngOnInit() {
    this.db.get('competitions-type').then((types) => {
      this.types = types.list;
    }).catch(e => console.log(e));
  }

  openCriteriaAlertOf(typeId) {
    this.db.get('competitions-type').then((types) => {
      const type = _.find(types.list, { id: typeId });
      this.db.get('criteria-list').then((criteria) => {
        const inputs = criteria.list.map(critere => {
          const checked = type.criteria.indexOf(critere.id) != -1;
          return {
            type: 'checkbox',
            label: `[${critere.short.toUpperCase()}]` + ' ' + critere.name,
            value: critere.id,
            checked
          }
        })

        this.alertCtrl.create({
          title: 'Critères',
          inputs,
          buttons: [{
            text: "Fermer",
            handler: (data) => {
              this.saveCriteriaOfType(type, data)
            }
          }
          ]
        }).present();
      })
    })

  }

  saveCriteriaOfType(type, criteria) {
    this.db.get('competitions-type').then((types) => {
      const idx = _.findIndex(types.list, { id: type.id });
      types.list[idx].criteria = criteria;

      this.db.put(types);
    }).catch(e => console.log(e));
  }

  addType() {
    this.db.get('competitions-type').then(types => {
      const id = _.last(types.list).id + 1;

      const newType = {
        id,
        name: this.newTypeName,
        criteria: [1, 2, 3, 4]
      };

      types.list.push(newType);

      this.db.put(types).then(() => {
        console.log('saving types ...');
        this.newTypeName = '';

        this.types.push(newType);
      })
    })
  }

  removeType(id) {
    console.log('removing type ...');
    console.log(id);

    this.alertCtrl.create({
      title: 'Attention',
      message: 'Voulez-vous vraiment supprimer ce type de compétition',
      buttons: [{
        text: 'Oui',
        handler: () => {
          this.db.get('competitions-type').then(types => {
            const idx = _.findIndex(types.list, { id });
            types.list.splice(idx, 1);

            this.db.put(types).then(() => {
              this.types.splice(idx, 1);
            })
          }).catch(e => console.log(e))
        }
      },
      {
        text: 'Non',
        handler: () => { }
      }]
    })
      .present();
  }

  logout() {

  }


}