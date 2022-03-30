import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaygroundComponent } from './playground/playground.component';
import { PlayGroundGuardService } from "./guards/access_guard";

import { JoinplayerComponent } from './joinplayer/joinplayer.component';

const routes: Routes = [
  { path: 'join', component: JoinplayerComponent },
  { path: 'playground', component: PlaygroundComponent, canActivate:[PlayGroundGuardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
