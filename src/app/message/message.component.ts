import { Component, Input, inject, effect } from '@angular/core';
import { DbService, Chat } from '../db-service/db-service.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  DbService: DbService = inject(DbService);
  @Input() data: Chat | undefined = undefined;
  profilePicture: string = '';

  constructor() {
    effect(() => {
      this.DbService.getProfilePicture(this.data!.userId).then( value => {
        this.profilePicture = value;
      })
    });
  }

  getTimestamp() {
    if (!this.data) return new Date(0);

    const ts = this.data.timestamp as Timestamp;
    if (ts !== null) return ts.toDate();
    return new Date(0);
  }
}
