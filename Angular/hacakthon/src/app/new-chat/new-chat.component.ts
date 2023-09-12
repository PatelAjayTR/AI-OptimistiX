import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.css']
})
export class NewChatComponent{

  title = 'chat-ui';

  @ViewChild('chatListContainer') list?: ElementRef<HTMLDivElement>;
  chatInputMessage: string = "";
  human = {
    id: 1,
    profileImageUrl: 'https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_960_720.png'
  }
 
  bot = {
    id: 2,
    profileImageUrl: 'https://media.istockphoto.com/photos/3d-illustration-of-virtual-human-on-technology-background-picture-id1181533674?s=612x612'
  }
 
  chatMessages: {
    user: any,
    message: string
  }[] = [
    {
      user: this.bot,
      message: "hi, I'm an AI. You can start any conversation..."
    },
  ];
 
  ngAfterViewChecked() {
    this.scrollToBottom()
  }
 
  send() {
    this.chatMessages.push({
      message: this.chatInputMessage,
      user: this.human
    });
    console.log(this.chatMessages)
    this.chatInputMessage = ""
    this.scrollToBottom()
  }
 
  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({top: maxScroll, behavior: 'smooth'});
  }
 
  generateFakeId(): string {
    const current = new Date();
    const timestamp = current.getTime();
    return timestamp.toString()
  }
 
  clearConversation() {
 
  }

}
