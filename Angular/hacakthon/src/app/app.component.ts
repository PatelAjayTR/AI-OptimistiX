import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { error } from '@angular/compiler/src/util';

export class Message {
  constructor(public content: string, public sentBy: string) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private http: HttpClient) {

  }

  loading = false;
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
        message: "Hi, I'm OptimistiX AI bot. You can ask me anything..."
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

    if (this.chatInputMessage.toUpperCase() === 'HI' || this.chatInputMessage.toUpperCase() === 'HELLO') {
      this.chatMessages.push({
        message: 'Hi there!!',
        user: this.bot
      });
    }
    else {
      this.loading = true;
      this.getResponse(this.chatInputMessage).subscribe(data => {
        this.loading = false
        console.log({data})
        this.chatMessages.push({
          message: data[0].message.content,
          user: this.bot
        })
        document.getElementById('message-body').innerHTML = data[0].message.content;
      }, error => {
        this.chatMessages.push({
          message: "Please try again. Can you please clarify that again for me?",
          user: this.bot
        })
        this.loading = false
      });
    }
    this.chatInputMessage = ""
    this.scrollToBottom()
  }

  scrollToBottom() {
    const maxScroll = this.list?.nativeElement.scrollHeight;
    this.list?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  generateFakeId(): string {
    const current = new Date();
    const timestamp = current.getTime();
    return timestamp.toString()
  }

  clearConversation() {
    this.chatMessages = [
      {
        user: this.bot,
        message: "Hi, I'm OptimistiX AI bot. You can ask me anything..."
      },
    ]
  }

  getResponse(message: string): Observable<any> {
    return this.http.post("http://localhost:3000/api", { message: message });
  }
}
