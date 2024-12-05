import { inject, Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import {
  Firestore,
  doc,
  getDoc,
  addDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private firestore: Firestore = inject(Firestore);
  public user: User | undefined;

  private roomSubject = new BehaviorSubject<Room[]>([]);
  public Rooms$: Observable<Room[]> = this.roomSubject.asObservable();

  constructor() {
    this.init(); // this is so dumb, but idk another way
  }

  async init() {
    try {
      await this.getUser();
      this.getRooms();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async getUser() {
    // Fetch the current user's document
    // TODO: change to current user
    const username = 'eli';
    const userDoc = await getDoc(doc(this.firestore, 'users', username));

    if (!userDoc.exists()) {
      throw new Error('Document path /users/' + username + ' is invalid.');
    }

    this.user = userDoc.data() as User;
  }

  async getRooms() {
    if (!this.user)
      throw new Error('User undefined when trying to fetch rooms');

    if (!this.user.rooms || this.user.rooms.length <= 0) {
      console.warn('No rooms found for the user!');
      return;
    }

    let roomHolder: Room[] = [];

    for (let i = 0; i < this.user.rooms.length; i++) {
      let roomRef = this.user.rooms[i];
      let roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        console.error('Room ref ' + roomRef + " doesn't exist");
      } else {
        roomHolder.push(roomDoc.data() as Room);
        roomHolder[i].id = roomRef.id;
      }
    }
    if (roomHolder.length > 0) this.roomSubject.next(roomHolder);
  }

  // this can't actually accept a Chat type because of serverTimestamp and id etc
  post(message: any) {
    //return addDoc(this.ChatsCollection, message);
    return;
  }
}

export interface Chat {
  color: string;
  message: string;
  timestamp: Timestamp;
  userName: string;
}

export interface User {
  timestamp: Timestamp;
  userName: string;
  rooms: DocumentReference[];
}

export interface Room {
  name: string;
  timestamp: Timestamp;
  users: any;
  id: string | undefined;
}
