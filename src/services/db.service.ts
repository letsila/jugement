import { Injectable } from "@angular/core";
// import { Platform } from 'ionic-angular';

// Déclaration nécessaire pour rendre la librairie PouchDb
// lisible par typeScript.
// declare var require: any;
// let PouchDB: any = require("pouchdb");

import PouchDB from 'pouchdb';

declare let emit: any;

@Injectable()
export class DbService {
  db: any;
  remote: any;
  couchdbUrl: string = "http://50.116.7.99:5984/gdg-hackathon";
  // couchdbUrl: string = "http://50.116.7.99:5984/judgement-db";
  // couchdbUrl: string = "http://localhost:5984/judgement-db";

  constructor() {
    this.db = new PouchDB("jugement", {
      // adapter: "websql",
      iosDatabaseLocation: "default",
      auto_compaction: true
    });

    this.remote = new PouchDB(this.couchdbUrl, {
      ajax: {
        // headers: {
        //   Authorization: 'Basic ' + window.btoa('admin:hCLr0u78ZvIt')
        // },
        timeout: 60000
      },
      retry: true
    });
  }

  /**
   * Création des design doc qui sera appelé à l'instanciation de l'app,
   * cf. app.component.ts.
 */
  createAllDesignDoc() {
    let ddocs = [];

    // Ddoc pour retrouver toutes les sessions d'un utilisateur.
    ddocs.push(
      this.createDesignDoc("judgeSheets", function (doc) {
        if (doc.judgeId) {
          emit(doc.competitionId);
        }
      })
    );

    // Insertion des ddocs.
    // ddocs.forEach(ddoc => {
    //   this.db
    //     .put(ddoc)
    //     .then(() => {
    //       console.log("ddoc inseré");
    //     })
    //     .catch(e => {
    //       console.log("ddoc insertion error");
    //       console.log(e);
    //     });
    // });
  }


  getJudgeSheetOfCompetition(competitionId) {
    return this.db.query("judgeSheets", {
      key: competitionId,
      include_docs: true
    });
  }

  /**
   * Création d'un design doc pouch db.
   *
   * @param name
   * @param mapFunction
   * @returns {{_id: string, views: {}}}
   */
  createDesignDoc(name, mapFunction) {
    let ddoc = {
      _id: "_design/" + name,
      views: {}
    };
    ddoc.views[name] = { map: mapFunction.toString() };
    return ddoc;
  }

  update() {
    return this.db.replicate.from(this.remote, {
      live: false,
      retry: true
    })
      .on('change', function (change) {
        console.log('changing ...');
      })
      .on('error', function (err) {
        console.log(err);
      });
  }

  /**
   * Sync
   */
  sync() {
    console.log('replicate from');
    this.db.replicate.from(this.remote, {
      live: false,
      retry: true
    })
      .on('change', function (change) {
        console.log('changing ...');
      })
      .on('error', function (err) {
        console.log(err);
      });
    return this.db.replicate.to(this.remote, {
      live: true,
      retry: true
    }).on('change', function (change) {
      console.log('changing ...');
    })
      .on('error', function (err) {
        console.log(err);
      });
  }


  /**
   * Fonction de réplication pouchdb -> couchdb
   */
  public replicateFromRemote(live = false) {
    return this.db.replicate.from(this.remote, {
      timeout: 60000,
      retry: true,
      live,
    });
  }

  /**
   * Fonction de réplication couchdb -> pouchdb
   */
  public replicateToRemote(live = false) {
    return this.db.replicate.to(this.remote, {
      timeout: 60000,
      retry: true,
      live,
    });
  }

  /**
   * Mapping du get de notre pouchDb pour la rendre accessible depuis
   * le provider.
   *
   * @param id
   * @returns {any}
   */
  get(id) {
    return this.db.get(id);
  }

  allDocs() {
    return this.db.allDocs({ include_docs: true });
  }

  /**
   * Mapping du bulkDocs
   *
   * @param arr
   */
  bulkDocs(arr) {
    return this.db.bulkDocs(arr);
  }

  /**
   * Mapping du put de notre pouchDb pour la rendre accessible depuis
   * le provider.
   *
   * @param obj
   * @returns {any|Observable<Response>|IDBRequest|Observable<T>}
   */
  put(obj) {
    return this.db.put(obj);
  }

  /**
   * Mapping du remove de notre pouchDb pour la rendre accessible depuis
   * le provider.
   *
   * @param id
   * @returns {any}
   */
  remove(id) {
    return this.db.remove(id);
  }
}