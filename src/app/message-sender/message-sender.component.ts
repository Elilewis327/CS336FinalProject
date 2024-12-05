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
  message: string = '';

  send() {
    const message = {
      timestamp: serverTimestamp(),
      message: this.message
    };

    this.DbService.post(message);
  }
}
