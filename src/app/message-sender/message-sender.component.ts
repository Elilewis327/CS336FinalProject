import { Component, inject, input } from '@angular/core';
import { DbService, Chat } from '../db-service/db-service.service';
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
  public DbService: DbService = inject(DbService);
  public message: string = '';
  public roomId = input("");
  

  public send() {
    const message = {
      timestamp: serverTimestamp(),
      message: this.message,
      username: this.DbService.user?.username,
      userId: this.DbService.user?.id,
    };

    this.DbService.sendMessage(message as Chat, this.roomId() as string);
    this.message = '';
  }
}
