import { Routes } from '@angular/router';
import { MessageViewerComponent } from '../message-viewer/message-viewer.component';

export const routes: Routes = [
  {path: '', component: MessageViewerComponent},
  {path: '**', redirectTo: ''},
];
