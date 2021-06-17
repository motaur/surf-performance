import { Point } from "./Point"

export class Wave {

  points: Point[] = []

  timeSeconds: number = 0
  distanceMeters: number = 0
  avgSpeed: number = 0
  maxspeed: number = 0
  straightDistanseMetersFromStartToEnd: number = 0

  constructor(points: Point[]) {
    this.points = points

    points.forEach((p, i) => {
      this.avgSpeed += p.speedKmhFromPrevToThisPoint
      if (p.speedKmhFromPrevToThisPoint > this.maxspeed)
        this.maxspeed = p.speedKmhFromPrevToThisPoint
      this.distanceMeters += i != 0 ? p.distanceKmFromPrevPoint * 1000 : 0 // not to sum first point
      this.timeSeconds += p.millisecondsFomPrevPoint / 1000
    })

    this.straightDistanseMetersFromStartToEnd = points[points.length - 1].calculateDistanceInKm(points[0]) * 1000

    this.avgSpeed = this.avgSpeed / points.length
  }
}
