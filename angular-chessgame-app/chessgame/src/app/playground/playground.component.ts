import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Player, MoveData, Message } from "../models/models";
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {
    MoveChange,
    NgxChessBoardComponent,
} from 'ngx-chess-board';
import { RelayService } from '../relay.service';
import { AuthService } from '../auth.service';


interface SimpleDialogData {
  title: string;
  content: string;
  action: string;
  reason: string;
  board:NgxChessBoardComponent;
}


@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})
export class PlaygroundComponent implements OnInit {
  @ViewChild('board')
  boardManager!: NgxChessBoardComponent;
  players:Player[]=[]; //List of players in game round(connected or not)
  connected:number=0; // number of players connected
  me!:string; // this user's name
  messages!:Message[]; //List of chat messages
  game_code!:string; 
  lightDisabled!:boolean;
  darkDisabled!:boolean;

  board_size:number=800;

  //Observables
  resizeobserver!:ResizeObserver;




  constructor(
    public router: Router,
    private ref:ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private relay:RelayService,
     private auth:AuthService)
    {

    
  }

  truncate_game_code(text: string): string {
    /* This function reduces the game code length so it fits in the box */
    let charlimit = 5;
    if(!text || text.length <= charlimit )
    {
        return text;
    }
    let without_html = text.replace(/<(?:.|\n)*?>/gm, '');
    return without_html.substring(0, charlimit) + "...";
  }

  
  moveCallback(move:MoveChange):void{
    //Function called on board piece move
    var move_history=this.boardManager.getMoveHistory();
    var board_state=this.boardManager.getFEN();
    this.relay.updateBoard(board_state,move_history[move_history.length-1].move);
  }


  openSnackBar(message: string, action: string|undefined) {
    this._snackBar.open(message, action,{duration:3000});
  }

  copy_game_code(){
    navigator.clipboard.writeText(`${this.game_code}`);
    this.openSnackBar('Code copied', 'Okay');
  }

  display_players(){
    let output:string ="";
    for (let player of this.players){
      output+=`  player ${player.username} |`;
      
    }
    this.openSnackBar(output,'Close');
  }

  resetBoard():void{
    this.dialog.open(SimpleDialogComponent,{
      width:"250px",
      data:{
        title: "Are you sure you want to reset the board?",
        content: "This action cannot be reverted",
        action: "Reset board",
        reason: "reset",
        board:this.boardManager,

      }
    });
  }

  play_move_sound():void{
    let audio: HTMLAudioElement = new Audio('../../assets/move.mp3');
    audio.play();
  }

  disconnect():void{
    this.dialog.open(SimpleDialogComponent,{
      width:"250px",
      data:{
        title: "Are you sure you wnat leave the game",
        content: "You can always rejoin with the game code and your username",
        action: "Leave game",
        reason: "disconnect",
        board:this.boardManager,

      }
    });
    

  }

  get_current_player():string{
    /*
    Dark side of chess board is always the initiator
    Check if light side is disabled and return initiator else return the other player
     */
    return this.boardManager.lightDisabled?this.players.filter(e=>e.initiator)[0].username:this.players.filter(e=>!e.initiator)[0].username; 
  }

  

  ngOnInit(): void {
    this.me=history.state.data.username;
    this.game_code=history.state.data.code;

    //Resizes components as screen size changes
    this.resizeobserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (entry.contentRect.width<=810){
          this.board_size=entry.contentRect.width-20;
        }else{
          this.board_size=800;

        }
        this.ref.detectChanges();
      });
    });

    let body:Element=document.querySelector('body') || new Element();
    
    this.resizeobserver.observe(body);

    



    // Listens for a checkmate
    this.relay.checkmate_receiver().subscribe((data:any)=>{
      
      if (this.dialog.openDialogs.length>1) this.dialog.closeAll();
      this.dialog.open(SimpleDialogComponent,{
        width:"250px",
        data:{
          title: `CHECKMATE ${data.winner==this.me?"🥳🥳":"😥🥺"}`,
          content: data.winner==this.me?`You won the game no possible moves left.`:`No possible options for escape, ${data.winner} wins this round.`,
          action: "Reset board",
          reason: "reset",
          board:this.boardManager,
  
        }
      });

    });

    //Listens for a stalemate
    this.relay.stalemate_receiver().subscribe((data:any)=>{
      this.dialog.closeAll();
      this.dialog.open(SimpleDialogComponent,{
        width:"250px",
        data:{
          title: "STALEMATE",
          content: "No winner, match ends null",
          action: "Reset board",
          reason: "reset",
          board:this.boardManager,
  
        }
      });

    });

    //Listens for player exit
    this.relay.player_leave_game().subscribe((data)=>{
      this.players=data.players as Player[];
      this.connected=this.players.filter(player=>player.connected).length;
      this.ref.detectChanges();
      this._snackBar.open(`Player ${data.player} disconected` ,"ok",{
        duration: 3000,
      });
    });


    //Listens for a board reset
    this.relay.onreset().subscribe((data)=>{
      this.boardManager.reset()
      this.ref.detectChanges();
      this._snackBar.open(data.player===this.me?"Board succesfully resetted":`Player ${data.player} resetted the game` ,"",{
        duration: 3000,
      });
    });


  }

  ngAfterViewInit(): void {
    this.relay.connect();
    this.messages=history.state.data.messages as Message[]; // loads messages

    /* 
      Checks if the round is new,
      if new then we join the game using
      the join_game_dispatch without loading
      data else we join game and load previous data 
    */

    if (!history.state.data.new_game){
      this.relay.join_game_dispatch(this.me,this.game_code);
      let fen=history.state.data.game_state;
      this.boardManager.setFEN(fen);
      this.players=history.state.data.players;
      
      this.ref.detectChanges();
    }
    else{
      this.relay.join_game_dispatch(this.me,this.game_code);
    }


    //Listen for new player in game
    this.relay.player_joined_game().subscribe((data) => {
      this.players=data.players;
      let player_object=this.players.filter(player=>player.username==history.state.data.username)[0];
      if(player_object && player_object.initiator){
        
        this.boardManager.lightDisabled=true;
        console.log("light disbled");
      }else{
        this.boardManager.darkDisabled=true;
        console.log("dark disabled");
  
  
      }
      if(data.player!==this.me){
        this._snackBar.open(`Player ${data.player} joined game` ,"ok",{
          duration: 3000,
        });
      }else{
        this._snackBar.open(`👋 Welcome ${data.player}` ,"ok",{
          duration: 3000,
        });

      }
      this.connected=this.players.filter(player=>player.connected).length;
      this.ref.detectChanges();
    
      

    });


    //Listen for new moves or play
    this.relay.getBoardUpdate().subscribe((data:MoveData) =>{
      console.log(data);
      this.boardManager.move(data.move);
      
      this.ref.detectChanges();

    });

    //Listen for any board moves or change
    this.boardManager.moveChange.subscribe((data:any)=>{
      this.play_move_sound();
      if(data.checkmate){
        this.boardManager.checkmate.emit();

      }else if(data.stalemate){
        this.boardManager.stalemate.emit();

      }
    });

    //Listen for any checkmates
    this.boardManager.checkmate.asObservable().subscribe(()=>{
      console.log("checkmate");
      let previous_player=this.players.filter((e)=>e.username!=this.get_current_player())[0];
      this.relay.checkmate_dispatch(previous_player.username);

    });

    //Listen for stalemates
    this.boardManager.stalemate.asObservable().subscribe(()=>{
      console.log("stalemate");
      this.relay.stalemate_dispatch();
    });


    this.ref.detectChanges();
  }




  ngOnDestroy():void{
    this.resizeobserver.disconnect();
    this.relay.disconnect();
    this.auth.clearCredentials();
    history.replaceState({},'',"/playground");
    this.router.navigate(['/']);
    
  }



}


@Component({
  selector:"app-simple-dialog",
  templateUrl:"simpledialog.component.html",

})
export class SimpleDialogComponent{
  constructor(
    public dialogRef: MatDialogRef<SimpleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SimpleDialogData,
    private router:Router,
    private relay:RelayService,
    private auth:AuthService

  ){}

  resetBoard():void{
    this.data.board.reset();
    this.relay.reset(this.data.board.getFEN());

  }

  onClick():void{
    if(this.data.reason=='reset'){
      this.resetBoard()

    }else if(this.data.reason=='disconnect'){
      history.replaceState({},'',"/playground");
      this.relay.disconnect();
      this.auth.clearCredentials();
      this.router.navigate(['/']);
    }

    this.dialogRef.close()
  }

}

