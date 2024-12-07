import { Routes } from '@angular/router';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { LoginScreenComponent } from "../login-screen/login-screen.component";
import { CreateChatComponent } from '../create-chat/create-chat.component';


export const routes: Routes = [
  {path: '', component: MessageViewerComponent},
  {path: 'login', component: LoginScreenComponent },
  {path: 'new-chat', component: CreateChatComponent},
  {path: 'chat/:id', component: MessageViewerComponent},
  {path: '**', redirectTo: ''},
];
