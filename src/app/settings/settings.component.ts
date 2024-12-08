import { Component, inject, output } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { DbService } from "../db-service/db-service.service";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  public dbService = inject(DbService);
  public username = this.dbService.user!.username;
  public fontSize: number = localStorage["fontSize"] || 0;
  public fontSizeOut = output<number>();

  public updateFontSize(e: Event): void {
    this.fontSizeOut.emit((e.target! as HTMLFormElement)["valueAsNumber"]);
  }
}
