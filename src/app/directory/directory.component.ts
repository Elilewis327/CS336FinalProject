import { Component, inject } from '@angular/core';
import { DbService } from '../db-service/db-service.service';
import { CommonModule } from '@angular/common';
import { RoomComponent } from '../room/room.component';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, RoomComponent],
  templateUrl: './directory.component.html',
  styleUrl: './directory.component.css'
})
export class DirectoryComponent {
  DbService: DbService = inject(DbService);

}
