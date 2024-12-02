import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageSenderComponent } from '../message-sender/message-sender.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessageSenderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ChatApp';
}
