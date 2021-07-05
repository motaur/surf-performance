import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { SessionDetailsComponent } from './sessions/session-details/session-details.component';
import { SessionsComponent } from './sessions/sessions.component';

const routes: Routes = [
  { path: 'sessions', component: SessionsComponent },
  { path: '', component: MainComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
