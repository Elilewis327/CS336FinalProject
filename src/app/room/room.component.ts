import { Component, Input } from '@angular/core';
import { Room } from '../db-service/db-service.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, RoomComponent, RouterLink],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent {
  @Input() data: Room | undefined = undefined;
}
