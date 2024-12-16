import { Routes } from '@angular/router';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';
import { LoginScreenComponent } from '../login-screen/login-screen.component';
import { loggedInGuard, isMemberGuard } from '../guards/auth.guard';
import { CreateChatComponent } from '../create-chat/create-chat.component';
import { DirectoryComponent } from '../directory/directory.component';

export const routes: Routes = [
  { path: 'login', component: LoginScreenComponent },
  { path: 'new-chat', component: CreateChatComponent, canActivate: [loggedInGuard] },
  {
    path: 'chat/:id',
    component: MessageViewerComponent,
    canActivate: [loggedInGuard, isMemberGuard]
  }, 
  { path: '**', redirectTo: 'chat/All_Users' }, //redirect to all users chat by default
];
