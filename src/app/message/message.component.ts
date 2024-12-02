import { Component, Input } from '@angular/core';
import { Chat } from '../db-service/db-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() data: Chat | undefined = undefined;
}
