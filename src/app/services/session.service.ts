import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import gpxParser from 'gpxparser';
import { Point } from 'src/models/Point';
import { Session } from 'src/models/Session';
import { Wave } from 'src/models/Wave';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private httpClient: HttpClient) { }

  async getSession(sessionId: string): Promise<Session> {

    let response = await this.httpClient
      .get(/*sessionId */ "../../assets/gpx_1.gpx", { responseType: "text" })
      .toPromise();

    const parser = new gpxParser();
    parser.parse(response);

    let points: Point[] = []

    parser.tracks[0].points.forEach((p: { lat: number; lon: number; time: Date; }) => {
      points.push(new Point(p.lat, p.lon, p.time))
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
