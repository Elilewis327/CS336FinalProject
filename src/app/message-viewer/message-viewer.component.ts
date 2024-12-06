import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from '../message/message.component';
import { MessageSenderComponent } from '../message-sender/message-sender.component';
import { DirectoryComponent } from '../directory/directory.component';
import { DbService } from '../db-service/db-service.service';
import { Chat } from '../db-service/db-service.service';

@Component({
  selector: 'app-message-viewer',
  standalone: true,
  imports: [MessageComponent, CommonModule, MessageSenderComponent, DirectoryComponent],
  templateUrl: './message-viewer.component.html',
  styleUrl: './message-viewer.component.css',
})
export class MessageViewerComponent {
  DbService: DbService = inject(DbService);
  id = input<string>('');

  constructor() {
  }
}
