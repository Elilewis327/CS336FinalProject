import { Component, inject, output, input } from '@angular/core';
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
  public roomId = input('');
  public dbService = inject(DbService);
  public username: string = this.dbService.user!.username;
  public profilePicture: string = this.dbService.user!.photoURL;
  public fontSize: number = localStorage['fontSize'] || 0;
  public fontSizeOut = output<number>();
  public sideMenuCollapsed: boolean = true;
  public checkmark: boolean = false;
  public userToAdd: string = '';
  public alerts: Alert[] = [];

  public updateFontSize(e: Event): void {
    this.fontSizeOut.emit((e.target! as HTMLFormElement)['valueAsNumber']);
  }

  public async deleteRoom() {
    try {
      await this.dbService.deleteRoom(this.roomId() as string);
    } catch (e) {
      this.alerts.push({
        type: 'danger',
        message: 'You do not have permision to delete this room.',
      });
    }
  }

  public async addUser() {
    const userRef = await this.dbService.findMatchingUser(this.userToAdd);

    if (userRef === '') {
      this.alerts.push({
        type: 'warning',
        message: `Username ${this.userToAdd} not found.`,
      });
      return;
    }

    try {
      await this.dbService.addUserToRoom(userRef, this.roomId() as string);
    } catch (e) {
      this.alerts.push({ type: 'warning', message: `${e}` });
    }
  }

  public leaveRoom() {
    this.dbService.leaveRoom(this.roomId() as string);
  }

  public updatePFP(event: Event): void {
    let base64Encoding: string = '';

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        base64Encoding = reader.result as string;
        console.log(base64Encoding);
        this.profilePicture = base64Encoding;
      };
      reader.readAsDataURL(file);
    }
  }

  public updateUser(): void {
    this.dbService
      .updateUserInfo({
        ...this.dbService.user!,
        username: this.username,
        photoURL: this.profilePicture, // technically still dataURL...
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
