import { Injectable } from '@angular/core';
import { AlertController, LoadingController, PopoverController } from 'ionic-angular';

@Injectable()
export class HelperService {

  public loading: any;
  private _connectionType: string = 'none';

  constructor(public alertCtrl: AlertController,
    public popoverCtrl: PopoverController,
    public loadingCtrl: LoadingController) {
  }

  set connectionType(connectionType: string) {
    this._connectionType = connectionType;
  }

  get connectionType() {
    if (this._connectionType)
      return this._connectionType;
    return '';
  }

  /**
   * Retourne une instance de loading.
   */
  public getLoading(text: string = '') {
    console.log('presenting loading ...');
    return this.loadingCtrl.create({
      content: 'En cours de synchronisation ...'
    });
  }

  /**
   * Affiche la date du jour au format dd/mm/yyyy
   */
  public static getFormatedDate(today: Date, separator = '/') {
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    dd = (dd < 10) ? '0' + dd : dd;
    mm = (mm < 10) ? '0' + mm : mm;
    return dd + separator + mm + separator + yyyy;
  }

  /**
   * Padding number
   */
  public static zeroFill(number: any, width = 1, pad: any = undefined) {
    if (number === undefined) {
      return function (number, pad) {
        return this.zeroFill(width, number, pad)
      }
    }
    if (pad === undefined) pad = '0';
    width -= number.toString().length;
    if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number;
    return number + ''
  }

  /**
   * Formattage du timestamp
   * dd/mm/yyyy H:i
   */
  public static getFormatedDateWith(timestamp, separator = '/') {
    let thatDay: any = new Date(timestamp);
    let dd: any = thatDay.getDate();
    let mm: any = thatDay.getMonth() + 1; //January is 0!

    let yyyy = thatDay.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }

    return dd + separator + mm + separator + yyyy;
  }

  /**
   * Return time
   * 
   * @param timestamp 
   */
  public static getTime(timestamp) {
    let thatDay: any = new Date(timestamp);

    const hours = HelperService.zeroFill(thatDay.getHours(), 2, 0);
    const minutes = HelperService.zeroFill(thatDay.getMinutes(), 2, 0);
    const seconds = HelperService.zeroFill(thatDay.getSeconds(), 2, 0);

    return hours + ":" + minutes + ":" + seconds;
  }

  /**
   * Zero padding.
   *
   * zeroFill(4, 1) // '0001'
   * zeroFill(10, 55) // '0000000055'
   */
  public zeroFill(number, width, pad) {
    if (number === undefined) {
      return function (number, pad) {
        return this.zeroFill(width, number, pad)
      }
    }
    if (pad === undefined) pad = '0';
    width -= number.toString().length;
    if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number
    return number + ''
  }

}
