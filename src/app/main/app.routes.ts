import { Routes } from '@angular/router';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { LoginScreenComponent } from '../login-screen/login-screen.component';
import { authGuard } from '../guards/auth.guard';
import { CreateChatComponent } from '../create-chat/create-chat.component';

export const routes: Routes = [
 // { path: '', component: MessageViewerComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginScreenComponent },
  { path: 'new-chat', component: CreateChatComponent, canActivate: [authGuard] },
  {
    path: 'chat/:id',
    component: MessageViewerComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'chat/All_User' }, //redirect to all users chat by default
];
