import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DirectoryComponent } from '../directory/directory.component';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { DbService } from '../db-service/db-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessageViewerComponent, DirectoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ChatApp';
  public DbService: DbService = inject(DbService);
}
