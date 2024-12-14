import { Component, inject } from '@angular/core';
import { DbService } from '../db-service/db-service.service';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.css'
})
export class LoginScreenComponent {
  public DbService: DbService = inject(DbService);
}
