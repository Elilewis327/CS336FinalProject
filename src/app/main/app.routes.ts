import { Routes } from '@angular/router';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { LoginScreenComponent } from "../login-screen/login-screen.component";


export const routes: Routes = [
  {path: '', component: MessageViewerComponent},
  {path: 'login', component: LoginScreenComponent },
  {path: ':id', component: MessageViewerComponent},
  {path: '**', redirectTo: ''},
];
