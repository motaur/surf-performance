
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Point as ParserPoint } from 'gpxparser';
import GpxParser from 'gpxparser';
import { Point } from 'src/models/Point';
import { Session } from 'src/models/Session';
import FitParser, { Activity } from 'fit-file-parser';
// import { GarminApi } from "garmin-api-handler"
import { garminLogin, garminPassword } from 'src/cred';
import { triggerAsyncId } from 'async_hooks';
import { Observable } from 'rxjs';

// https://github.com/fabulator/garmin-api-handler/blob/master/src/GarminApi.ts
// https://github.com/sports-alliance/sports-lib
// https://github.com/Pythe1337N/garmin-connect
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private url = 'http://localhost:5000/'
  private login = 'activities'

  constructor(private httpClient: HttpClient) { }

  async backupGarmin(login: string, password: string) {
    let response = await this.httpClient
      .post(this.url, { login, password })
      .toPromise()
    return response
  }

  getDownloadedSessions(): Observable<any> {
    return this.httpClient.get(this.url + 'get_activities?login=' + this.login)
  }

  garminConnect(login: string, password: string) {

  }

  async getGpxSession(sessionId: string): Promise<Session> {

    let response = await this.httpClient
      .get(/*sessionId */ "../../assets/gpx_1.gpx", { responseType: "text" })
      .toPromise();

    const parser: GpxParser = new GpxParser();
    parser.parse(response);

    let points: Point[] = []

    parser.tracks[0].points.forEach((p: ParserPoint) => {
      //todo add hr, temperature and altitude parsing as extras
      points.push(new Point(p.lat, p.lon, p.time))
    });

    let calulatedPoints = this.calculateDistanceAndSpeed(points);
    let session = new Session(calulatedPoints)
    console.log(session)
    return session
  }

  async getFitSession(sessionId: string): Promise<Session> {
    let response: ArrayBuffer = await this.httpClient
      .get(this.url + `/get_activity_file?login=activities&id=${sessionId}`, { responseType: 'arraybuffer' })
      .toPromise();

    var parser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'km',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list'
    });

    let points: Point[] = []
    // TODO if activity type == Surfing, not need to find waves, just filter points that not containts lat lon,
    parser.parse(Buffer.from(response), function (error, data: Activity) {
      // Handle result of parse method
      if (error) {
        console.log(error);
      } else {
        data.records.forEach(r => {
          let p = new Point(r.position_lat, r.position_long, r.timestamp);
          p.heartRate = r.heart_rate;
          p.temp = r.temperature
          points.push(p)
        });
      }
    });

    let calulatedPoints = this.calculateDistanceAndSpeed(points);
    let session = new Session(calulatedPoints)
    console.log(session)
    return session
  }

  private calculateDistanceAndSpeed(points: Point[]): Point[] {

    //print points
    // this.points.forEach(p => {
    //   console.log('dist m: ' + p.distanceKm * 1000 + '; timeSeconds: ' + p.milliseconds / 1000 + '; speedKmH: ' + p.speedKmh)
    // })

    for (var i = 1; i < points.length; i++) {

      let calculatedPeedAndTime = points[i].getSpeedInKmh(points[i - 1])

      points[i].distanceKmFromPrevPoint = points[i].calculateDistanceInKm(points[i - 1]);
      points[i].millisecondsFomPrevPoint = calculatedPeedAndTime.millisecondsFomPrevPoint;
      points[i].speedKmhFromPrevToThisPoint = calculatedPeedAndTime.speedKmhFromPrevToThisPoint;
    }
    //clean ussless points with 0 distance
    points.forEach(p => {
      if (p.distanceKmFromPrevPoint * 1000 == 0) {
        const index = points.indexOf(p, 0);
        if (index > -1) {
          points.splice(index, 1);
        }
      }
    })
    //calulate again withou usless this.points
    for (var i = 1; i < points.length; i++) {
      let calculatedPeedAndTime = points[i].getSpeedInKmh(points[i - 1])

      points[i].distanceKmFromPrevPoint = points[i].calculateDistanceInKm(points[i - 1]);
      points[i].millisecondsFomPrevPoint = calculatedPeedAndTime.millisecondsFomPrevPoint;
      points[i].speedKmhFromPrevToThisPoint = calculatedPeedAndTime.speedKmhFromPrevToThisPoint;
    }

    //print points
    // this.points.forEach(p => {
    //   console.log('dist m: ' + p.distanceKm * 1000 + '; timeSeconds: ' + p.milliseconds / 1000 + '; speedKmH: ' + p.speedKmh)
    // })

    return points
  }
}


