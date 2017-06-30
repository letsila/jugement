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