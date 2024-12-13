import { Component, inject, Input } from '@angular/core';
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
  DbService: DbService = inject(DbService);
  message: string = '';
  @Input() roomId: string | undefined = undefined;

  send() {
    const message = {
      timestamp: serverTimestamp(),
      message: this.message,
      username: this.DbService.user?.username,
    };

    this.DbService.sendMessage(message as Chat, this.roomId as string);
  }
}
