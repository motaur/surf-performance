import { SessionService } from '../../services/session.service';
import { Component, OnChanges, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Wave } from 'src/models/Wave';
import '@elfalem/leaflet-curve'
import { Input } from '@angular/core';

//https://leafletjs.com/plugins.html#heatmaps
//https://github.com/mpetazzoni/leaflet-gpx
//https://github.com/elfalem/Leaflet.curve
//https://github.com/Oliv/leaflet-polycolor
//https://github.com/Igor-Vladyka/leaflet.motion

//https://stackblitz.com/edit/angular-slug
@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit, OnChanges {

  @Input()
  sessionId!: string;

  ngOnChanges(changes: any) {
    console.log(changes)
    this.sessionId = changes.sessionId.currentValue;
    this.ngOnInit()
  }

  map: L.Map | null = null
  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {

    this.sessionService.getFitSession(this.sessionId).then(session => {
      this.createMap(session.location);
      this.drawWaves(session.waves);
    });

    // this.sessionService.getGpxSession('1').then(session => {
    //   this.createMap(session.location);
    //   this.drawWaves(session.waves);
    // });
  }

  private drawWaves(waves: Wave[]) {
    waves.forEach(w => {
      var pointList: L.LatLng[] = [];
      w.points.forEach(p => {
        var latLon = new L.LatLng(p.lat, p.lon);
        pointList.push(latLon)
      });

      var polyline = new L.Polyline(pointList,
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

      //print each point
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
}
