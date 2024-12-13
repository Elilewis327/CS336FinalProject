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
  public fontSize: number = localStorage["fontSize"] || 0;
  public fontSizeOut = output<number>();
  public sideMenuCollapsed: boolean = true;
  public checkmark: boolean = false;

  public updateFontSize(e: Event): void {
    this.fontSizeOut.emit((e.target! as HTMLFormElement)["valueAsNumber"]);
  }

  public updateUser(): void {
    this.dbService.updateUserInfo({...this.dbService.user!, username: this.username})
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
