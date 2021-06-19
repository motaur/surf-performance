export class Point {

  //Fields
  lat: number;
  lon: number;
  date: Date;
  heartRate: number = -1;
  temp: number = -1;

  millisecondsFomPrevPoint: number = -1 //time between this and previous point
  distanceKmFromPrevPoint: number = -1 //distance between this and previous point
  speedKmhFromPrevToThisPoint: number = -1 // speed between this and previous point

  constructor(lat: number, lon: number, date: Date) {
    this.lat = lat;
    this.lon = lon;
    this.date = date;
  }

  /**
   *
   * @param prevPoint previous point or any other point
   * @returns distance in km between this point and prevPoint
   */
  calculateDistanceInKm(prevPoint: Point): number {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(this.lat - prevPoint.lat);  // deg2rad below
    var dLon = this.deg2rad(this.lon - prevPoint.lon);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(prevPoint.lat)) * Math.cos(this.deg2rad(this.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d
  }

  /**
   *
   * @param prevPoint previous point or any other point
   * @returns speed between this point and prevPoint
   */
  getSpeedInKmh(prevPoint: Point): { millisecondsFomPrevPoint: number, speedKmhFromPrevToThisPoint: number } {
    return {
      millisecondsFomPrevPoint: this.date.getTime() - prevPoint.date.getTime(),
      speedKmhFromPrevToThisPoint: this.distanceKmFromPrevPoint / (this.millisecondsFomPrevPoint / 1000 / 60 / 60)
    }
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }
}
