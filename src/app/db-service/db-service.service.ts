import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  setDoc,
  DocumentReference,
  Timestamp,
} from '@angular/fire/firestore';
import {
  Auth,
  signInWithPopup,
  user,
  OAuthProvider,
  User as FirebaseUser,
} from "@angular/fire/auth";
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private firestore: Firestore = inject(Firestore);

  private roomSubject = new BehaviorSubject<Room[]>([]);
  public Rooms$: Observable<Room[]> = this.roomSubject.asObservable();

  private fireAuth: Auth = inject(Auth);
  private user$: Observable<FirebaseUser | null> = user(this.fireAuth);
  public user: User | null = null;

  public async userLogin(providerName: string = "google.com"): Promise<void> {
    const provider = new OAuthProvider(providerName);
    const creds = await signInWithPopup(this.fireAuth, provider);
    // user$ is now set (same as creds)

    const userDoc = await getDoc(doc(this.firestore, "users", creds.user.uid));
    if (!userDoc.exists()) {
      // create user if they aren't in the db
      try {
        const userValues: User = {
          email: creds.user.email!,
          photoURL: creds.user.photoURL!,
          username: creds.user.email!.split("@")[0], // default to email
          rooms: [],
        };
        await setDoc(doc(this.firestore, "users", creds.user.uid), userValues);
      } catch (error) {
        console.error(error); // lazy
      }
    }
  }

  constructor() {
    this.user$.subscribe(async firebaseUser => {
      if (firebaseUser) {
        const docData = await getDoc(doc(this.firestore, "users", firebaseUser.uid));
        if (docData.exists())
          this.user = docData.data() as User;
        this.getRooms();
      }
    });
  }

  async getRooms() {
    if (!this.user)
      throw new Error('user undefined when trying to fetch rooms');

    if (!this.user.rooms || this.user.rooms.length <= 0) {
      console.warn('no rooms found for the user!');
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
  email: string;
  photoURL: string;
  username: string;
  rooms: DocumentReference[];
};

export interface Room {
  name: string;
  timestamp: Timestamp;
  users: any;
  id: string | undefined;
}
