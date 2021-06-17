import { Point } from "./Point";
import { Wave } from "./Wave";

export class Session {

  private waveMaxSpeedThresholdKmH: number = 40
  private waveMinSpeedThresholdKmH: number = 8
  private waveMinDistanceThresholdMeters: number = 8
  private waveMinTimeThresholdSeconds: number = 5
  private waveMinPointsThreshold: number = 5
  private waveMinTimeBetweenPointsSeconds: number = 2
  private waveRelationRatioBetweenStraightDistanceAndFullDistance: number = 0.6

  //replaced by time betwwen points
  // private waveMaxDistanceOfPointFromPrevPointThresholdMeters: number = 3

  //replaced by ratio
  // private waveMinDistanceBetweenStartAndEnfPointsMeters: number = 15

  waves: Wave[] = []
  location: L.LatLngTuple = [0, 0]
  lengthMinutes: number = 0
  startTime: Date
  endTime: Date
  paceWavesPerHour: number
  sumWavesDistance: number = 0


  constructor(points: Point[]) {
    this.startTime = points[0].date
    this.endTime = points[points.length - 1].date
    this.lengthMinutes = (this.endTime.getTime() - this.startTime.getTime()) / 1000 / 60
    this.waves = this.findWaves(points)
    this.waves.forEach(w => this.sumWavesDistance += w.distanceMeters)
    this.paceWavesPerHour = this.waves.length / (this.lengthMinutes / 60)
    this.location[0] = this.waves[0]?.points[0]?.lat
    this.location[1] = this.waves[0]?.points[0].lon
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
        p.millisecondsFomPrevPoint / 1000 <= this.waveMinTimeBetweenPointsSeconds
      ) {

        //add start point
        if (accumulatePoints.length == 0)
          accumulatePoints.push(points[i - 1]);

        // add current point
        accumulatePoints.push(p);
        accumulatedTimeSeconds += p.millisecondsFomPrevPoint / 1000
      }
      else if (this.getSumDistanceKm(accumulatePoints) * 1000 >= this.waveMinDistanceThresholdMeters
        &&
        accumulatedTimeSeconds >= this.waveMinTimeThresholdSeconds
        &&
        accumulatePoints.length + 1 >= this.waveMinPointsThreshold) {
        //add last point
        // accumulatePoints.push(p);
        waves.push(new Wave(accumulatePoints));
        accumulatePoints = [];
        accumulatedTimeSeconds = 0;
      }
      else {
        accumulatePoints = [];
        accumulatedTimeSeconds = 0;
      }
    })
    //filter usless waves by distance ratio
    waves = waves.filter(w => {
      return w.straightDistanseMetersFromStartToEnd / w.distanceMeters >= this.waveRelationRatioBetweenStraightDistanceAndFullDistance
    })
    return waves;
  }

  private getSumDistanceKm(points: Point[]): number {
    let distance: number = 0
    points.forEach(p => {
      distance += p.distanceKmFromPrevPoint
    })
    return distance
  }
}
