import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Point } from 'src/models/Point';
import { Wave } from 'src/models/Wave';
import { Session } from 'src/models/Session';

//https://github.com/elfalem/Leaflet.curve

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit {

  map: L.Map | null = null
  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {

    this.sessionService.getSession('1').then(session => {
      this.createMap(session.center);
      this.drawWaves(session.waves);
    });
  }

  private drawWaves(waves: Wave[]) {
    waves.forEach(w => {
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

  createMap(center: L.LatLngTuple /*[31.673172684386373, 34.549383195117116]*/) {
    let map = L.map('map').setView(
      center,
      18
    );

    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 100,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    this.map = map
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
