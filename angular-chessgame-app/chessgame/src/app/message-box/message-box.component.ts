import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { Player, Message } from "../models/models";
import { RelayService } from '../relay.service';


@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css']
})
export class MessageBoxComponent implements OnInit {

  @Input() messages!:Message[];

  @Input() user_id!:string;
  @Input() players!:Player[];

  @ViewChild("messageInput")
  messageInput!:MatFormField;

  @ViewChild("msgcontainer") private msgcontainer!: ElementRef;

  constructor(private relay:RelayService,private ref:ChangeDetectorRef) { 
    this.messages=[];
    
  }

  sendMessage():void{
    let content:string=this.messageInput._control.value.trim();
    if (content!="") {
      let message:Message=new Message("",content,1,history.state.data.username);
      this.relay.sendMessage(message);
      this.messageInput._control.value="";
      
    }
    this.play_notification_sent_sound();
    
  }

  checkKey(event:KeyboardEvent):void{
    if (event.key==="Enter") this.sendMessage();

  }



  ngOnInit(): void {


  }

  play_notification_receive_sound():void{
    let audio: HTMLAudioElement = new Audio('../../assets/not.mp3');
    audio.play();
  }
  play_notification_sent_sound():void{
    let audio: HTMLAudioElement = new Audio('../../assets/sent.wav');
    audio.play();
  }

  ngAfterViewInit(): void {
    //Listen for new messages and update UI
    this.relay.getMessage().subscribe((data)=>{
      this.messages=data.messages as Message[];
      this.ref.detectChanges();
      this.scrollToBottom();
      if(this.messages[this.messages.length-1].author_id!==this.user_id){
        this.play_notification_receive_sound();
      }
      
    });
    this.messages=this.relay.chatmessages;
    this.ref.detectChanges();
    this.scrollToBottom();

  }

  //Scrolls message box to bottom

  scrollToBottom(): void {
    this.msgcontainer.nativeElement.scroll({
      top: this.msgcontainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

}

