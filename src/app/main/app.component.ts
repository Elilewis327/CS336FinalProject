import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DirectoryComponent } from '../directory/directory.component';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { DbService } from '../db-service/db-service.service';
import { SettingsComponent } from '../settings/settings.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MessageViewerComponent,
    DirectoryComponent,
    SettingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ChatApp';
  public DbService: DbService = inject(DbService);
  public fontSize: number = localStorage['fontSize'] || 18;

  public updateFontSize(newVal: number): void {
    this.fontSize = newVal;
    localStorage['fontSize'] = newVal;
  }
}
