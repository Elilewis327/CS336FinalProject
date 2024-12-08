import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from '../message/message.component';
import { MessageSenderComponent } from '../message-sender/message-sender.component';
import { DirectoryComponent } from '../directory/directory.component';
import { DbService } from '../db-service/db-service.service';
import { Chat } from '../db-service/db-service.service';
import { SettingsComponent } from "../settings/settings.component";
import { NgStyle } from "@angular/common";

@Component({
  selector: 'app-message-viewer',
  standalone: true,
  imports: [MessageComponent, CommonModule, MessageSenderComponent, DirectoryComponent, SettingsComponent, NgStyle],
  templateUrl: './message-viewer.component.html',
  styleUrl: './message-viewer.component.css',
})
export class MessageViewerComponent {
  public dbService: DbService = inject(DbService);
  id = input<string>('');
  public fontSize: number = localStorage["fontSize"] || 18;

  public updateFontSize(newVal: number): void {
    this.fontSize = newVal;
    localStorage["fontSize"] = newVal;
  }

  constructor() {
  }
}
