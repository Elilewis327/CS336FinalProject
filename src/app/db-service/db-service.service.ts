import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  DocumentReference,
  Timestamp,
  query,
  where,
  serverTimestamp, 
  FieldValue,
  arrayUnion
} from '@angular/fire/firestore';
import {
  Auth,
  signInWithPopup,
  user,
  OAuthProvider,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private firestore: Firestore = inject(Firestore);

  private roomSubject = new BehaviorSubject<Room[]>([]);
  public Rooms$: Observable<Room[]> = this.roomSubject.asObservable();

  private fireAuth: Auth = inject(Auth);
  private user$: Observable<FirebaseUser | null> = user(this.fireAuth);
  public user: User | undefined;
  public chats$: { id: Observable<Chat[]> } | {} = {};

  public async userLogin(providerName: string = 'google.com'): Promise<void> {
    const provider = new OAuthProvider(providerName);
    const creds = await signInWithPopup(this.fireAuth, provider);
    // user$ is now set (same as creds)

    const userDoc = await getDoc(doc(this.firestore, 'users', creds.user.uid));
    if (!userDoc.exists()) {
      // create user if they aren't in the db
      try {
        const userValues: User = {
          email: creds.user.email!,
          photoURL: creds.user.photoURL!,
          username: creds.user.email!.split('@')[0], // default to email
          rooms: [],
        };
        await setDoc(doc(this.firestore, 'users', creds.user.uid), userValues);
      } catch (error) {
        console.error(error); // lazy
      }
    }
  }

  constructor() {
    this.user$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        const docData = await getDoc(
          doc(this.firestore, 'users', firebaseUser.uid)
        );
        if (docData.exists()) this.user = docData.data() as User;
        this.getRooms();
      }
    });
  }

  private async getRooms() {
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
  public async post(message: any) {
    //return addDoc(this.ChatsCollection, message);
    return;
  }

  public async getChats(id: string) {
    if (!this.user) return;
  }

  public async findMatchingUser(keyword: string): Promise<string> {
    const usersCollection = collection(this.firestore, 'users');
    const userQuery = query(usersCollection, where('username', '==', keyword));
    const possibleMatches: User[] = await firstValueFrom(collectionData(userQuery, { idField: 'id' })) as User[];
  
    // Check for a match and return the user ID if available
    if (possibleMatches.length > 0) {
      return possibleMatches[0].id!;
    }
    
    return "";
  }

  public async createChatRoom(room: Room) {
    const roomsCollection = collection(this.firestore, 'rooms');
    room['timestamp'] = serverTimestamp();

    let userRefs: any = [];
    room['users'].forEach(user => {
      userRefs.push(doc(this.firestore, 'users/' + user.id))
    });

    room['users'] = userRefs;
    let roomDocument = await addDoc(roomsCollection, room);

    userRefs.forEach( (user: any) => {
      updateDoc(doc(this.firestore, `users/${user.id}`), { rooms: arrayUnion(doc(this.firestore, 'rooms/' + roomDocument.id)) });
    });

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
  id?: string;
}

export interface Room {
  name: string;
  timestamp?: Timestamp | FieldValue;
  users: any[];
  id?: string;
}
