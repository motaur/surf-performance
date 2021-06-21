import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Wave } from 'src/models/Wave';
import '@elfalem/leaflet-curve'

//https://leafletjs.com/plugins.html#heatmaps
//https://github.com/mpetazzoni/leaflet-gpx
//https://github.com/elfalem/Leaflet.curve
//https://github.com/Oliv/leaflet-polycolor
//https://github.com/Igor-Vladyka/leaflet.motion
@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit {

  map: L.Map | null = null
  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {

    // dxthis.garminService.login()

    this.sessionService.getFitSession("1")

    this.sessionService.getGpxSession('1').then(session => {
      this.createMap(session.location);
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

      var polyline =

        // TODO use curves to beutify waves
        // L.curve(['M', [pointList[0].lat, pointList[0].lng],
        //   'C', [pointList[1].lat, pointList[1].lng],
        //   [pointList[2].lat, pointList[2].lng],
        //   [pointList[3].lat, pointList[3].lng]
        // [48.45835188280866, 33.57421875000001],
        // [50.680797145321655, 33.83789062500001],
        // ],
        //   { color: 'red', fill: false })

        new L.Polyline(pointList,
          {
            color: this.getRandomColor()
          });


      polyline.addTo(this.map as L.Map);

      //prin each point
      pointList.forEach(i => L.circle(i, 0.01,
        {
          stroke: true,
          color: 'green'
        }
      ).addTo(this.map as L.Map));

      //prin each point
      L.circle(pointList[0], 0.01,
        {
          color: 'blue'
        }
      ).addTo(this.map as L.Map);

      L.circle(pointList[pointList.length - 1], 0.01,
        {
          color: 'blue'
        }
      ).addTo(this.map as L.Map);

      // polyline.trace([0, 1]).forEach(i => L.circle(i, { color: 'green' }).addTo(this.map as L.Map));

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
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    // }).addTo(map);

    this.map = map
  }

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
