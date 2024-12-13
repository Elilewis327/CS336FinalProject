import { Component, inject, output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DbService } from '../db-service/db-service.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Alert } from '../create-chat/create-chat.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgbModule, NgbAlertModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  @Input() roomId: string | undefined = undefined;
  public DbService = inject(DbService);
  public username: string = this.DbService.user!.username;
  public fontSize: number = localStorage['fontSize'] || 0;
  public fontSizeOut = output<number>();
  public sideMenuCollapsed: boolean = true;
  public checkmark: boolean = false;
  public userToAdd: string = '';
  public alerts: Alert[] = [];

  public updateFontSize(e: Event): void {
    this.fontSizeOut.emit((e.target! as HTMLFormElement)['valueAsNumber']);
  }

  public deleteRoom() {
    this.DbService.deleteRoom(this.roomId as string);
  }

  public async addUser() {
    const userRef = await this.DbService.findMatchingUser(this.userToAdd);

    if (userRef === "") {
      this.alerts.push({type: 'warning', message: `Username ${this.userToAdd} not found.`});
      return;
    }

    try {
      await this.DbService.addUserToRoom(userRef, this.roomId as string);
    } catch (e){
      this.alerts.push({type: 'warning', message: `${e}`});
    }
  }

  public leaveRoom() {
    this.DbService.leaveRoom(this.roomId as string);
  }

  public updateUser(): void {
    this.DbService.updateUserInfo({
      ...this.DbService.user!,
      username: this.username,
    })
      .then(() => {
        this.checkmark = true;
        setTimeout(() => {
          this.checkmark = false;
        }, 2000);
      })
      .catch((e) => {
        console.error('Updating user info:', e);
      });
  }

  public close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
