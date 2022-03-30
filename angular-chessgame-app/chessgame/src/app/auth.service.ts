import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _username:string=""; 
  private _game_code:string="";

  constructor(){

  }
  setCredentials(uname:string,code:string):void{
    this._username=uname;
    this._game_code=code;
  }

  get_name():string {return this._username}
  get_code():string {return this._game_code}

  is_authenticated():boolean{
    if(this._username!="" && this._game_code!=""){
      return true
    }
    return false;
  }

  clearCredentials():void{
    this._username="";
    this._game_code="";
  }
}
