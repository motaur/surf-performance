import { Wave } from "./Wave";

export class Session {

  waves: Wave[] = []
  center: L.LatLngTuple = [0, 0]

  constructor(waves: Wave[]) {
    this.waves = waves
    this.center[0] = waves[0].points[0].lat
    this.center[1] = waves[0].points[0].lon
  }
}
