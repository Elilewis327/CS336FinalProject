import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface User {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserCreationService {
  private firestore: Firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');
  public chats$: Observable<User[]> = collectionData(this.usersCollection);

  public registerUser(username: User): void {
    addDoc(this.usersCollection, username);
  }
}
