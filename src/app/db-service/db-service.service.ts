import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
  arrayUnion,
  arrayRemove,
  deleteDoc,
  orderBy,
} from '@angular/fire/firestore';
import {
  Auth,
  signInWithPopup,
  user,
  OAuthProvider,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private router: Router = inject(Router);
  private firestore: Firestore = inject(Firestore);

  public Rooms$: Observable<Room[]> | undefined;

  private fireAuth: Auth = inject(Auth);
  private userDocumentRef: DocumentReference | undefined;
  private user$: Observable<FirebaseUser | null> = user(this.fireAuth);
  public user: User | null = null;
  public chats$: Observable<Chat[]> | undefined;

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
          id: creds.user.uid,
        };
        await setDoc(doc(this.firestore, 'users', creds.user.uid), userValues);

        const userData = await getDoc(
          doc(this.firestore, 'users', creds.user.uid)
        );
        if (userData.exists()) console.log(userData.data());

        await this.addUserToRoom(creds.user.uid, 'All_User');

        this.router.navigate(['']);
      } catch (error) {
        console.error(error); // lazy
      }
    }
    this.router.navigate(["/"]); // send user back home
  }

  public async userLogout(): Promise<void> {
    await this.fireAuth.signOut();
    this.router.navigate(['/login']);
  }

  public async updateUserInfo(userInfo: User): Promise<void> {
    await setDoc(doc(this.firestore, "users", this.user?.id!), userInfo);
  }

  constructor() {
    this.user$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        this.userDocumentRef = doc(this.firestore, 'users', firebaseUser.uid);
        const docData = await getDoc(this.userDocumentRef);
        if (docData.exists()) {
          this.user = docData.data() as User;
          this.user.id = firebaseUser.uid;
          this.router.navigate(['']); // user logged in / is logged in, so let them through
        }
        this.getRooms();
      } else {
        this.user = null;
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

    const roomsCollection = collection(this.firestore, 'rooms');
    const roomsQuery = query(
      roomsCollection,
      where('users', 'array-contains', this.userDocumentRef)
    );
    this.Rooms$ = collectionData(roomsQuery, { idField: 'id' });
  }

  public async sendMessage(message: Chat, roomId: string) {
    if (!this.user) return;

    const chatsCollection = collection(
      this.firestore,
      'rooms/' + roomId + '/chats'
    );
    addDoc(chatsCollection, message);
  }

  public async getChats(roomId: string) {
    if (!this.user) return;

    const chatsCollection = collection(
      this.firestore,
      'rooms/' + roomId + '/chats'
    );
    const sortedQuery = query(chatsCollection, orderBy('timestamp', 'asc'));
    this.chats$ = collectionData(sortedQuery);
  }

  public async findMatchingUser(keyword: string): Promise<string> {
    const userDoc = await getDoc(doc(this.firestore, 'users/' + keyword));
    if (userDoc.exists()) {
      return keyword; // we were given an id
    }

    const usersCollection = collection(this.firestore, 'users');
    const userQuery = query(usersCollection, where('username', '==', keyword));
    const possibleMatches: User[] = await firstValueFrom(collectionData(userQuery, { idField: 'id' })) as User[];

    // Check for a match and return the user ID if available
    if (possibleMatches.length > 0) {
      return possibleMatches[0].id!;
    }

    return '';
  }



  public async createChatRoom(room: Room) {
    const roomsCollection = collection(this.firestore, 'rooms');
    room['timestamp'] = serverTimestamp();

    let userRefs: DocumentReference[] = [];

    room['users'].forEach((user) => {
      userRefs.push(doc(this.firestore, 'users/' + user.id));
    });

    room['users'] = userRefs;
    const roomDocument = await addDoc(roomsCollection, room);
    const chatsCollection = collection(
      this.firestore,
      'rooms',
      roomDocument.id,
      'chats'
    );

    userRefs.forEach(async (ref: any) => {
      const userDoc = await getDoc(ref);
      if (!userDoc.exists()) return; // how even lol, this should never happen

      const username = (userDoc.data() as User).username;

      const joinedChat = {
        message: `${username} Joined The Room. Say Hi!`,
        timestamp: serverTimestamp(),
        username: username,
      } as Chat;

      updateDoc(ref, {
        rooms: arrayUnion(doc(this.firestore, 'rooms/' + roomDocument.id)),
      });

      addDoc(chatsCollection, joinedChat);
    });
  }

  public async deleteRoom(id: string) {
    const roomDocRef = doc(this.firestore, 'rooms/' + id);
    const roomDoc = await getDoc(roomDocRef);

    if (!roomDoc.exists()) return; // already gone

    const roomDocData = roomDoc.data() as Room;

    //check if allowed to delete
    if (roomDocData.users[0].id !== this.user?.id) {
      console.warn(
        `Not permitted. You Are: ${this.user?.id}, while owner is: ${roomDocData.users[0].id}`
      );
      return; // not allowed
    }

    roomDocData.users.forEach((user) => {
      updateDoc(user, {
        ['rooms']: arrayRemove(doc(this.firestore, `rooms/${id}`)),
      });
    });

    deleteDoc(roomDocRef);

    this.router.navigate(['']);
  }

  public async addUserToRoom(userId: string, roomId: string) {
    const roomDocRef = doc(this.firestore, 'rooms/' + roomId);
    const userDocRef = doc(this.firestore, 'users/' + userId);
    const chatsCollection = collection(
      this.firestore,
      'rooms',
      roomId,
      'chats'
    );

    const username = (await getDoc(userDocRef)).data()!['username'];

    const joinedChat = {
      message: `${username} Joined The Room. Say Hi!`,
      timestamp: serverTimestamp(),
      username: username,
    } as Chat;
    addDoc(chatsCollection, joinedChat);

    updateDoc(userDocRef, { rooms: arrayUnion(roomDocRef) });
    updateDoc(roomDocRef, { users: arrayUnion(userDocRef) });
  }
}

export interface Chat {
  message: string;
  timestamp: Timestamp | FieldValue;
  username: string;
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
