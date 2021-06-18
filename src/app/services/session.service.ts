
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Point as ParserPoint } from 'gpxparser';
import GpxParser from 'gpxparser';
import { Point } from 'src/models/Point';
import { Session } from 'src/models/Session';
import FitParser, { Activity } from 'fit-file-parser';


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private httpClient: HttpClient) { }

  async getGpxSession(sessionId: string): Promise<Session> {

    let response = await this.httpClient
      .get(/*sessionId */ "../../assets/gpx_1.gpx", { responseType: "text" })
      .toPromise();

    const parser: GpxParser = new GpxParser();
    parser.parse(response);

    let points: Point[] = []

    console.log

    parser.tracks[0].points.forEach((p: ParserPoint) => {

      points.push(new Point(p.lat, p.lon, p.time))
    });

    let calulatedPoints = this.calculateDistanceAndSpeed(points);
    let session = new Session(calulatedPoints)
    console.log(session)
    return session
  }

  async getFitSession(sessionId: string)//: Promise<Session>
  {
    let response: ArrayBuffer = await this.httpClient
      .get(/*sessionId */ "../../assets/6903482603_ACTIVITY.fit", { responseType: 'arraybuffer' })
      .toPromise();

    var parser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'km',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list'
    });

    parser.parse(Buffer.from(response), function (error, data: Activity) {
      // Handle result of parse method
      if (error) {
        console.log(error);
      } else {
        console.log((data));
      }
    });





    // let points: Point[] = []

    // tracks[0].points.forEach((p: { lat: number; lon: number; time: Date; }) => {
    //   points.push(new Point(p.lat, p.lon, p.time))
    // });

    // let calulatedPoints = this.calculateDistanceAndSpeed(points);
    // let session = new Session(calulatedPoints)
    // console.log(session)
    // return session
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
