import { Routes } from '@angular/router';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { LoginScreenComponent } from "../login-screen/login-screen.component";
import { authGuard } from "../guards/auth.guard";


export const routes: Routes = [
  {path: '', component: MessageViewerComponent, canActivate: [authGuard] },
  {path: 'login', component: LoginScreenComponent},
  {path: ':id', component: MessageViewerComponent, canActivate: [authGuard] },
  {path: '**', redirectTo: ''},
];
