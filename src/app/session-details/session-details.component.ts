import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import gpxParser from 'gpxparser';
import { HttpClient } from '@angular/common/http';
import { Point } from 'src/models/Point';
import { Wave } from 'src/models/Wave';

//https://github.com/elfalem/Leaflet.curve

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit {

  map: L.Map | null = null
  points: Point[] = []
  waves: Wave[] = []

  waveMaxSpeedThresholdKmH: number = 40
  waveMinSpeedThresholdKmH: number = 8
  waveMinDistanceThresholdMeters: number = 6
  waveMinTimeThresholdSeconds: number = 5
  waveMinPointsThreshold: number = 3
  waveMaxDistanceOfPointFromPrevPointThresholdMeters: number = 8

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.createMap();
    this.loadFile();
  }

  loadFile() {
    this.httpClient.get("../../assets/gpx_1.gpx", { responseType: "text" }).subscribe(data => {
      const parser = new gpxParser()
      parser.parse(data)

      parser.tracks[0].points.forEach((p: { lat: number; lon: number; time: Date; }) => {
        this.points.push(new Point(p.lat, p.lon, p.time))
      });

      this.calculateDistanceAndSpeed()

      //clean ussless points with 0 distance
      this.points.forEach(p => {
        if (p.distanceKmFromPrevPoiint * 1000 == 0) {
          const index = this.points.indexOf(p, 0);
          if (index > -1) {
            this.points.splice(index, 1);
          }
        }
      })

      this.calculateDistanceAndSpeed();

      // this.points.forEach(p => {
      //   console.log('dist m: ' + p.distanceKm * 1000 + '; timeSeconds: ' + p.milliseconds / 1000 + '; speedKmH: ' + p.speedKmh)
      // })

      this.findWaves();
      console.log(this.waves);
      this.drawWaves()
    })
  }

  private drawWaves() {
    this.waves.forEach(w => {
      var pointList: L.LatLng[] = [];

      w.points.forEach(p => {
        var latLon = new L.LatLng(p.lat, p.lon);
        pointList.push(latLon)
      })

      var polyline = new L.Polyline(pointList, {
        color: this.getRandomColor()
      });
      polyline.addTo(this.map as L.Map);
    })
  }

  private getRandomColor(): string {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + " ," + g + "," + b + ")";
  }


  createMap() {
    let map = L.map('map').setView(
      [31.673172684386373, 34.549383195117116],
      18
    );

    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 100,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    this.map = map
  }

  calculateDistanceAndSpeed() {
    for (var i = 1; i < this.points.length; i++) {
      this.points[i].getDistanceInKm(this.points[i - 1]);
      this.points[i].getSpeedInKmh(this.points[i - 1]);
    }
  }

  findWaves() {
    let accumulatePoints: Point[] = [];
    let accumulatedTimeSeconds = 0;

    this.points.forEach((p, i) => {

      if (p.speedKmhFromPrevToThisPoint >= this.waveMinSpeedThresholdKmH
        &&
        p.speedKmhFromPrevToThisPoint <= this.waveMaxSpeedThresholdKmH
        &&
        p.distanceKmFromPrevPoiint * 1000 <= this.waveMaxDistanceOfPointFromPrevPointThresholdMeters) {

        //add start point
        if (accumulatePoints.length == 0)
          accumulatePoints.push(this.points[i - 1]);

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
        this.waves.push(new Wave(accumulatePoints));
        accumulatePoints = [];
        accumulatedTimeSeconds = 0;
      }
      else {
        accumulatePoints = [];
        accumulatedTimeSeconds = 0;
      }
    })
  }

  private getSumDistanceKm(points: Point[]): number {
    let distance: number = 0
    points.forEach(p => {
      distance += p.distanceKmFromPrevPoiint
    })
    return distance
  }

  // readFile(file: File) {
  //   var reader = new FileReader();
  //   reader.onload = () => {
  //     console.log(reader.result);

  //   };
  //   reader.readAsText(file);
  // }

  // loadFile() {

  //   const points = []

  //   let gpxdata: any

  //   try {

  //     fs.readFile(path.join(__dirname, '../../assests/gpx_1.gpx'), 'utf8', (error, data: any) => {
  //       gpxdata = data
  //     })

  //     const parser = new gpxParser()
  //     parser.parse(gpxdata)

  //     console.log(gpxdata)

  //     parser.tracks.forEach((track: { points: { time: any; }[]; }) => {
  //       track.points.forEach((point: { time: any; }) => {
  //         points.push({ ...point, time: point.time ?? new Date() })
  //       })
  //     })

  //   } catch (err) {
  //     console.error(err)
  //   }




  //   // var gpxFile = '../assets/gpx_1.gpx'; // URL to your GPX file or the GPX itself

  //   // var g = new L.GPX(gpxFile, {
  //   //   async: true,
  //   //   polyline_options: {
  //   //     color: 'red'
  //   //   }
  //   // });

  //   // g.on('loaded', function(e) {
  //   //   var gpxObject = e.target,
  //   //     name = gpxObject.get_name(),
  //   //     distM = gpxObject.get_distance(),
  //   //     distKm = gpxObject / 1000,
  //   //     speed = gpxObject.get_moving_speed();


  //   //   var info =
  //   //     'Name: ' +
  //   //     name +
  //   //     '</br>' +
  //   //     'Distance: ' +
  //   //     distKm +
  //   //     ' km ' +
  //   //     ' </br>' +
  //   //     'average speed: ' +
  //   //     speed +
  //   //     ' km/h </br>';

  //   //   // register popup on click
  //   //   gpxObject.getLayers()[0].bindPopup(info);
  //   // });

  //   // g.addTo(this.map);
  // }
}
