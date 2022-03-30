import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Message ,GameRound,MoveData} from './models/models';


interface MessageData{
  type:string;

}

@Injectable({
  providedIn: 'root'
})
export class RelayService {
  boardState!:string;
  chatmessages!:Message[];
  server:string="";


  constructor(private socket: Socket, private http: HttpClient) {}

  


  sendMessage(msg: Message) {
    this.socket.emit('chatmessage', msg);
  }
  getMessage() {
    return this.socket.fromEvent<any>('chatmessage').pipe(map((data) => data));
  }

  getBoardUpdate(){
    return this.socket.fromEvent<MoveData>('move');
  }

  updateBoard(state:string,move:string){
    this.socket.emit('update-board-state', {state:state,move:move});
  }

  reset(board_state:string){
    this.socket.emit("reset",{state:board_state});
  }
  onreset(){
    return this.socket.fromEvent<any>('reset');
  }


  getDisconnect(){
    return this.socket.fromEvent<any>('leave').pipe(map((data) => data));
  }

  join_game_dispatch(username:string,game_code:string){
    this.socket.emit('join-game', {username:username,code:game_code} );
  }

  player_joined_game(){
    return this.socket.fromEvent<any>('new-player');
  }

  player_leave_game(){
    return this.socket.fromEvent<any>('leave');
  }

  stalemate_dispatch(){
    this.socket.emit('stalemate',{});
  }

  checkmate_dispatch(winner:string){
    this.socket.emit('checkmate',{"winner":winner});
  }

  stalemate_receiver(){
    return this.socket.fromEvent<any>("stalemate");
  }
  checkmate_receiver(){
    return this.socket.fromEvent<any>("checkmate");
  }

  disconnect(){
    this.socket.disconnect();
  }

  connect(){
    this.socket.connect();
  }

  ngOnDestroy():void{
    this.socket.disconnect();
  }



}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  boardState!:string;
  chatmessages!:Message[];
  server:string="";


  constructor(private http: HttpClient) {}



  join_game(name:string,game_code:string){
    //Post data to server and return response
    return this.http.post<any>(`${this.server}/join-game`,{
      username:name,
      code:game_code,
    });
  }

  startGame(name:string){
    console.log("requesting game code ...")
    console.log(name);
    //Post name and await response which contains game code
    return this.http.post<GameRound>(`${this.server}/new-game/`,{username:name});
  }


}