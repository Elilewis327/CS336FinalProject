import { Component, inject } from '@angular/core';
import { DbService, Room } from '../db-service/db-service.service';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { DirectoryComponent } from '../directory/directory.component';

@Component({
  selector: 'app-create-chat',
  standalone: true,
  imports: [FormsModule, NgbAlertModule, DirectoryComponent],
  templateUrl: './create-chat.component.html',
  styleUrl: './create-chat.component.css'
})
export class CreateChatComponent {
  public DbService: DbService = inject(DbService);
  
  public user: string = "";
  public alerts: Alert[] = [];
  public newRoom: Room = {name: '', users: []}

  constructor () {
    this.addSelf();
  }

  public async addSelf(){
    this.newRoom.users.push({username: this.DbService.user?.username, id: this.DbService.user?.id});
  }

  public async addUser(){
    this.user = this.user.trim();
    if (this.user === "") return;

    const userRef = await this.DbService.findMatchingUser(this.user);
    if (userRef === "") {
      this.alerts.push({type: 'warning', message: `Username ${this.user} not found.`});
      this.user = "";
      return;
    }

    for(let i = 0; i < this.newRoom.users.length; i++){ 
      console.log(this.newRoom.users[i].id);
      if (this.newRoom.users[i].id === userRef){ 
        this.alerts.push({type: 'danger',  message: `Username ${this.user} already is a member of this chat.`});
        this.user = "";
        return;
      }
    }
    
    this.newRoom.users.push({username: this.user, id: userRef});
    this.user = "";
  }

  public close(alert: Alert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

}

export interface Alert {
	type: string;
	message: string;
}
