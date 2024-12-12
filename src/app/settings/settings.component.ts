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
  public username = this.dbService.user!.username;
  public fontSize: number = localStorage["fontSize"] || 0;
  public fontSizeOut = output<number>();

  public sideMenuCollapsed = true;

  public updateFontSize(e: Event): void {
    this.fontSizeOut.emit((e.target! as HTMLFormElement)["valueAsNumber"]);
  }
}
