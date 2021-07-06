import { SessionService } from './../services/session.service';
import { Component, OnInit } from '@angular/core';

export interface ISession {
  date: string;
  id: string;
  format: string;
}

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {
  sessions: Array<ISession> = []

  sessionId!: string;

  setSessionId(sessionId: string) {
    // slug setter function
    this.sessionId = sessionId;
  }

  getSessionId() {
    return this.sessionId;
  }

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionService.getDownloadedSessions().subscribe(res => {
      console.log(res) // testing session list as json

      //parsing session as files name list
      // this.sessions = (res as string[]).filter(s => s.length == 40)
      //   .map(s => { return { date: s.substring(0, 25), id: s.substring(26, 36), format: s.substring(37, 40) } })
    })
  }
}
