export class Player{
    username:string;
    connected:boolean;
    initiator:boolean=false;
  
    constructor(username:string,connected:boolean= false,initiator:boolean=false){
      this.username=username;
      this.connected=connected
    }
  
  
}
export class Move{
    player_id:number;
    data:object;
    constructor(player_id:number,data:object){
        this.player_id=player_id;
        this.data=data;
    }
}

export class Message{
    id: string;
    content: string;
    datetime: number;
    author_id:string;

    constructor(id:string,content:string,datetime:number,author_id:string){
        this.id=id;
        this.content=content;
        this.datetime=datetime;
        this.author_id=author_id;
    }
}
  
export class MoveData{
    move!:string;
    state!:string;

    
  
  }

export class GameRound{
    players!:Player[];
    code!:string;
    messages!:Message[];
    current_state!:string;
    
    game_start!:number;
}