import { Point } from "./Point"

export class Wave {

  points: Point[] = []

  timeSeconds: number = 0
  distanceMeters: number = 0
  avgSpeed: number = 0
  maxspeed: number = 0

  constructor(points: Point[]) {
    this.points = points

    points.forEach(p => {
      this.avgSpeed += p.speedKmhFromPrevToThisPoint
      if (p.speedKmhFromPrevToThisPoint > this.maxspeed)
        this.maxspeed = p.speedKmhFromPrevToThisPoint
      this.distanceMeters += p.distanceKmFromPrevPoiint * 1000
      this.timeSeconds += p.millisecondsFomPrevPoint / 1000
    })

    this.avgSpeed = this.avgSpeed / points.length
  }
}
