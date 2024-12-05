import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageSenderComponent } from '../message-sender/message-sender.component';
import { DirectoryComponent } from '../directory/directory.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessageSenderComponent, DirectoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ChatApp';
}
