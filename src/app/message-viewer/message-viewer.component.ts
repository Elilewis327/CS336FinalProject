import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from '../message/message.component';
import { DbService } from '../db-service/db-service.service';
import { Chat } from '../db-service/db-service.service';
import { MessageSenderComponent } from '../message-sender/message-sender.component';

@Component({
  selector: 'app-message-viewer',
  standalone: true,
  imports: [MessageComponent, CommonModule, MessageSenderComponent],
  templateUrl: './message-viewer.component.html',
  styleUrl: './message-viewer.component.css',
})
export class MessageViewerComponent {
  public DbService: DbService = inject(DbService);
  id = input<string>('');
 
  constructor() {
    
  }
}
