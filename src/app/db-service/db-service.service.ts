import { inject, Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  firestore: Firestore = inject(Firestore);
  chats$: Observable<Chat[]>;
  ChatsCollection: any;

  constructor() {
    this.ChatsCollection = collection(this.firestore, 'FinalProjectChats');
    const sortedQuery = query(this.ChatsCollection, orderBy('timestamp', 'asc'));
    this.chats$ = collectionData(sortedQuery);
  }

  // this can't actually accept a Chat type because of serverTimestamp and id etc
  post(message: any) {
    return addDoc(this.ChatsCollection, message);
  }
}

export interface Chat {
  color: string;
  message: string;
  timestamp: Timestamp;
  userName: string;
}
