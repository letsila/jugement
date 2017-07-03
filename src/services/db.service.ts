import { Injectable } from "@angular/core";
// import { Platform } from 'ionic-angular';

// Déclaration nécessaire pour rendre la librairie PouchDb
// lisible par typeScript.
declare var require: any;
let PouchDB: any = require("pouchdb");
declare let emit: any;

@Injectable()
export class DbService {
  public db: any;
  public remote: any;
  public couchdbUrl: string = "http://50.116.7.99:5984/judgement-db";
  // public couchdbUrl: string = "http://192.168.1.101:5984/judgement-db";

  constructor() {
    this.db = new PouchDB("jugement", {
      adapter: "websql",
      iosDatabaseLocation: "default",
      auto_compaction: true
    });

    this.remote = new PouchDB(this.couchdbUrl, {
      skipSetup: true,
      ajax: {
        timeout: 60000
      },
      retry: true
    });
  }

  /**
 * Création des design doc qui sera appelé à l'instanciation de l'app,
 * cf. app.component.ts.
 */
  public createAllDesignDoc() {
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
    ddocs.forEach(ddoc => {
      this.db
        .put(ddoc)
        .then(() => {
          console.log("ddoc inseré");
        })
        .catch(e => {
          console.log("ddoc insertion error");
          console.log(e);
        });
    });
  }


  public getJudgeSheetOfCompetition(competitionId) {
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
  public createDesignDoc(name, mapFunction) {
    let ddoc = {
      _id: "_design/" + name,
      views: {}
    };
    ddoc.views[name] = { map: mapFunction.toString() };
    return ddoc;
  }

  /**
   * Sync
   */
  public sync() {
    this.db.sync(this.remote, {
      live: true,
      retry: true
    }).on('change', function (change) {
      console.log('changing ...');
    })
      .on('error', function (err) {
        console.log(err);
      });;
  }

  /**
   * Mapping du get de notre pouchDb pour la rendre accessible depuis
   * le provider.
   *
   * @param id
   * @returns {any}
   */
  public get(id) {
    return this.db.get(id);
  }

  public allDocs() {
    return this.db.allDocs({ include_docs: true });
  }

  /**
   * Mapping du bulkDocs
   *
   * @param arr
   */
  public bulkDocs(arr) {
    return this.db.bulkDocs(arr);
  }

  /**
   * Mapping du put de notre pouchDb pour la rendre accessible depuis
   * le provider.
   *
   * @param obj
   * @returns {any|Observable<Response>|IDBRequest|Observable<T>}
   */
  public put(obj) {
    return this.db.put(obj);
  }

  /**
   * Mapping du remove de notre pouchDb pour la rendre accessible depuis
   * le provider.
   *
   * @param id
   * @returns {any}
   */
  public remove(id) {
    return this.db.remove(id);
  }
}