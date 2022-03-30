import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {  Router} from "@angular/router";
import { MatFormField } from "@angular/material/form-field";
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef} from '@angular/material/dialog';
import { ApiService } from '../relay.service';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-create-game-dialog',
  templateUrl: './create-game-dialog.component.html',
  styleUrls: ['./create-game-dialog.component.css']
})
export class CreateGameDialogComponent implements OnInit {
  error:boolean=false;
  @ViewChild("username")
  username_field!:MatFormField;
  username_validator = new FormControl('', [Validators.required,Validators.minLength(2)]);


 
  constructor( private router:Router, public dialogRef: MatDialogRef<CreateGameDialogComponent>, private ref:ChangeDetectorRef, public api:ApiService,private auth:AuthService) { 

  }

  getErrorMessage() {
    if (this.username_validator.hasError('required')) {
      return 'You must enter a value';
    }

    return this.username_validator.hasError('minlength') ? 'Username must be minimum 2 characters' : '';
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  start_game():void{
    let username:string=this.username_field._control.value;
    if(username.trim().length>=2){
      this.dialogRef.close();
      this.api.startGame(username).subscribe((res)=>{
        console.log(JSON.stringify(res));
        var code: string =res.code;
        this.auth.setCredentials(username,code);
        this.router.navigate(['/playground'],{state:{data:{'username':username,'code':code,'new_game':true}}});
      })
      
    }else{
      this.error=true;
      this.ref.detectChanges();
    }
    
  }
  ngOnInit(): void {
  }

}
