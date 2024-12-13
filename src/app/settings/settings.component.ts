import { Component, inject, output } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { DbService } from "../db-service/db-service.service";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgbModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  public dbService = inject(DbService);
  public username: string = this.dbService.user!.username;
  public profilePicture: string = this.dbService.user!.photoURL;
  public fontSize: number = localStorage["fontSize"] || 0;
  public fontSizeOut = output<number>();
  public sideMenuCollapsed: boolean = true;
  public checkmark: boolean = false;

  public updateFontSize(e: Event): void {
    this.fontSizeOut.emit((e.target! as HTMLFormElement)["valueAsNumber"]);
  }

  public updatePFP(event: Event): void {
    let base64Encoding: string = "";

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        base64Encoding = reader.result as string;
        console.log(base64Encoding);
        this.profilePicture = base64Encoding;

      }
      reader.readAsDataURL(file);
    }
  }

  public updateUser(): void {
    this.dbService.updateUserInfo(
      {
        ...this.dbService.user!,
        username: this.username,
        photoURL: this.profilePicture, // technically still dataURL...
      })
      .then(() => {
        this.checkmark = true;
        setTimeout( () => {
          this.checkmark = false;
        }, 2000);
      })
      .catch((e) => {
        console.error("Updating user info:", e);
      });
  }
}
