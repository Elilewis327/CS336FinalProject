import { Component, inject } from '@angular/core';
import { DbService } from '../db-service/db-service.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-sender',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-sender.component.html',
  styleUrl: './message-sender.component.css',
})
export class MessageSenderComponent {
  DbService: DbService = inject(DbService);
  settings: {color: string, userName: string} = {color: 'black', userName: 'Anonymous'};
  message: string = '';

  constructor (){
    if (localStorage.getItem('settings')  !== null){
      this.settings = JSON.parse(localStorage.getItem('settings')!);
    } 
  }

  saveSettings(){
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  send() {
    const message = {
      timestamp: serverTimestamp(),
      color: this.settings.color,
      userName: this.settings.userName,
      message: this.message
    };

    this.DbService.post(message);
  }
}
