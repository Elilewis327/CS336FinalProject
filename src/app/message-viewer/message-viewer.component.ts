import { Component, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from '../message/message.component';
import { DbService } from '../db-service/db-service.service';
import { MessageSenderComponent } from '../message-sender/message-sender.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-message-viewer',
  standalone: true,
  imports: [
    MessageComponent,
    CommonModule,
    MessageSenderComponent,
    SettingsComponent,
  ],
  templateUrl: './message-viewer.component.html',
  styleUrl: './message-viewer.component.css',
})
export class MessageViewerComponent {
  public DbService: DbService = inject(DbService);
  public id = input<string>('');
  public fontSize: number = localStorage['fontSize'] || 18;

  constructor() {
    effect(() => {
      this.DbService.getChats(this.id());
    });
  }

  public updateFontSize(newVal: number): void {
    this.fontSize = newVal;
    localStorage['fontSize'] = newVal;
  }

}
