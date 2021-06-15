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

  waveMaxSpeedThresholdKmH: number = 40
  waveMinSpeedThresholdKmH: number = 8
  waveMinDistanceThresholdMeters: number = 6
  waveMinTimeThresholdSeconds: number = 5
  waveMinPointsThreshold: number = 3
  waveMaxDistanceOfPointFromPrevPointThresholdMeters: number = 8

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
    let waves: Wave[] = this.findWaves(calulatedPoints);

    return new Session(waves)
  }

  private calculateDistanceAndSpeed(points: Point[]): Point[] {

    //print points
    // this.points.forEach(p => {
    //   console.log('dist m: ' + p.distanceKm * 1000 + '; timeSeconds: ' + p.milliseconds / 1000 + '; speedKmH: ' + p.speedKmh)
    // })

    for (var i = 1; i < points.length; i++) {
      points[i].getDistanceInKm(points[i - 1]);
      points[i].getSpeedInKmh(points[i - 1]);
    }
    //clean ussless points with 0 distance
    points.forEach(p => {
      if (p.distanceKmFromPrevPoiint * 1000 == 0) {
        const index = points.indexOf(p, 0);
        if (index > -1) {
          points.splice(index, 1);
        }
      }
    })
    //calulate again withou usless this.points
    for (var i = 1; i < points.length; i++) {
      points[i].getDistanceInKm(points[i - 1]);
      points[i].getSpeedInKmh(points[i - 1]);
    }

    //print points
    // this.points.forEach(p => {
    //   console.log('dist m: ' + p.distanceKm * 1000 + '; timeSeconds: ' + p.milliseconds / 1000 + '; speedKmH: ' + p.speedKmh)
    // })

    return points
  }

  private findWaves(points: Point[]): Wave[] {
    let waves: Wave[] = []
    let accumulatePoints: Point[] = [];
    let accumulatedTimeSeconds = 0;

    points.forEach((p, i) => {

      if (p.speedKmhFromPrevToThisPoint >= this.waveMinSpeedThresholdKmH
        &&
        p.speedKmhFromPrevToThisPoint <= this.waveMaxSpeedThresholdKmH
        &&
        p.distanceKmFromPrevPoiint * 1000 <= this.waveMaxDistanceOfPointFromPrevPointThresholdMeters) {

        //add start point
        if (accumulatePoints.length == 0)
          accumulatePoints.push(points[i - 1]);

        accumulatePoints.push(p);
        accumulatedTimeSeconds += p.millisecondsFomPrevPoint / 1000
      }
      else if (this.getSumDistanceKm(accumulatePoints) * 1000 >= this.waveMinDistanceThresholdMeters
        &&
        accumulatedTimeSeconds >= this.waveMinTimeThresholdSeconds
        &&
        accumulatePoints.length + 1 >= this.waveMinPointsThreshold) {
        //add last point
        accumulatePoints.push(p);
        waves.push(new Wave(accumulatePoints));
        accumulatePoints = [];
        accumulatedTimeSeconds = 0;
      }
      else {
        accumulatePoints = [];
        accumulatedTimeSeconds = 0;
      }
    })
    console.log(waves);
    return waves;
  }

  private getSumDistanceKm(points: Point[]): number {
    let distance: number = 0
    points.forEach(p => {
      distance += p.distanceKmFromPrevPoiint
    })
    return distance
  }
}
