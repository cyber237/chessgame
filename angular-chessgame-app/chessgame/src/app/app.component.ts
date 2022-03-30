import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from "@angular/material/dialog";
import { CreateGameDialogComponent } from './create-game-dialog/create-game-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chessgame';
  constructor(public router: Router ,public dialog: MatDialog ){}
  openDialog(): void {
    const dialogRef = this.dialog.open(CreateGameDialogComponent, {
      width: '250px',});
  }
}
