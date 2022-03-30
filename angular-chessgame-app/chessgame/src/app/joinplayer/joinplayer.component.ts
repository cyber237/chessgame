import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateGameDialogComponent } from '../create-game-dialog/create-game-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../relay.service';
import { AuthService } from '../auth.service';
import { Player } from '../models/models';

@Component({
  selector: 'app-joinplayer',
  templateUrl: './joinplayer.component.html',
  styleUrls: ['./joinplayer.component.css']
})
export class JoinplayerComponent implements OnInit {
  error:boolean=false;
  error_description:string="";

  constructor(public router: Router, public dialog: MatDialog, private api:ApiService,private ref : ChangeDetectorRef,private auth:AuthService){}

  join_game(name:string, code:string):void{
    console.log(`${name},${code}`);

    this.api.join_game(name,code).subscribe((data)=>{
      console.log(data);
      if (data.sucess){
        this.auth.setCredentials(name,code);
        this.router.navigate(['/playground'],{state:{data:{'username':name,'messages':data.messages,'code':code,'new_game':false,'game_state':data.game_state,'players':data.players as Player[]}}});

      }else{
        this.error=true;
        this.error_description=data.description;
        this.ref.detectChanges();


      }

    })

    

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateGameDialogComponent, {
      width: '250px',});
  }

  ngOnInit(): void {

  }

}
