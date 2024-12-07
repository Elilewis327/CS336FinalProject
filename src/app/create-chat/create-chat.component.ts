import { Component, inject } from '@angular/core';
import { DbService, Room } from '../db-service/db-service.service';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-chat',
  standalone: true,
  imports: [FormsModule, NgbAlertModule],
  templateUrl: './create-chat.component.html',
  styleUrl: './create-chat.component.css'
})
export class CreateChatComponent {
  public DbService: DbService = inject(DbService);
  
  user: string = "";
  alerts: Alert[] = [];
  newRoom: Room = {name: '', users: []}

  async addUser(){
    this.user = this.user.trim();
    if (this.user === "") return;

    const userRef = await this.DbService.findMatchingUser(this.user);
    if (userRef === "") {
      this.alerts.push({type: 'warning', message: `Username ${this.user} not found.`});
      this.user = "";
      return;
    }
    this.newRoom.users.push({username: this.user, id: userRef});
    this.user = "";
  }

  close(alert: Alert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

}

interface Alert {
	type: string;
	message: string;
}
