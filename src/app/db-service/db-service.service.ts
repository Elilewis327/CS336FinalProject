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
  docSnapshots,
  DocumentReference,
  DocumentSnapshot,
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
import { Observable, firstValueFrom, takeWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private router: Router = inject(Router);
  private firestore: Firestore = inject(Firestore);

  public Rooms$: Observable<Room[]> | undefined;

  private fireAuth: Auth = inject(Auth);
  private userDocumentRef: DocumentReference | undefined;
  private userSubscription$: Observable<User> | null = null;
  private authUser$: Observable<FirebaseUser | null> = user(this.fireAuth); // the auth representation of the user
  public user: User | null = null; // the information representation of the user
  public chats$: Observable<Chat[]> | undefined;

  public async userLogin(providerName: string = 'google.com'): Promise<void> {
    const provider = new OAuthProvider(providerName);
    const creds = await signInWithPopup(this.fireAuth, provider);
    // authUser$ is now set (same as creds)
    const userDoc = await getDoc(doc(this.firestore, 'users', creds.user.uid));
    if (!userDoc.exists()) {
      // create user if they aren't in the db
      try {
        const email = creds.user.email ?? "";
        const username = (providerName === "google.com")
                          ? email!.split('@')[0]
                          : creds.user.displayName ?? "unnamed-githuber";
        const userValues: User = {
          email,
          photoURL: creds.user.photoURL!,
          username,
          rooms: [],
          id: creds.user.uid,
        };
        await setDoc(doc(this.firestore, 'users', creds.user.uid), userValues);

        const userData = await getDoc(
          doc(this.firestore, 'users', creds.user.uid)
        );
        this.user = userData.data() as User;

        try {
          await this.addUserToRoom(creds.user.uid, 'All_Users');
        } catch (e) {
          console.error(
            'Something broke trying to add new user to All_User chat',
            e
          );
        }
      } catch (error) {
        console.error("Something broke adding new user to db", error); // only slightly lazy
      }
    }
  }

  public async userLogout(): Promise<void> {
    await this.fireAuth.signOut();
  }

  public async updateUserInfo(userInfo: User): Promise<void> {
    await setDoc(doc(this.firestore, 'users', this.user?.id!), userInfo);
  }

  constructor() {
    this.authUser$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        this.userDocumentRef = doc(this.firestore, 'users', firebaseUser.uid);
        const docData = await getDoc(this.userDocumentRef);
        if (docData.exists()) {
          this.user = docData.data() as User; // immediately set user info to kick off below actions
          // given correct auth info, set up this.user to get updates from the db
          // about respective user document
          this.userSubscription$ = docSnapshots(this.userDocumentRef)
            .pipe(takeWhile(unused => this.user != null)) // stop and close this observable when a user logs out
            .subscribe(
            (userSnapshot: DocumentSnapshot<User>) => {
              this.user = userSnapshot.data() as User;
            }
          );
          this.getRooms();
          this.router.navigate(['']); // user logged in / is logged in, so automatically let them through
        }
      } else {
        this.router.navigate(['/login']);
        this.user = null;
      }
    });
  }

  private async getRooms(): Promise<void> {
    if (!this.user)
      throw new Error('user undefined when trying to fetch rooms');

    const roomsCollection = collection(this.firestore, 'rooms');
    const roomsQuery = query(
      roomsCollection,
      where('users', 'array-contains', this.userDocumentRef)
    );
    this.Rooms$ = collectionData(roomsQuery, { idField: 'id' });
  }

  public async sendMessage(message: Chat, roomId: string): Promise<void> {
    if (!this.user) return;

    const chatsCollection = collection(
      this.firestore,
      'rooms/' + roomId + '/chats'
    );
    addDoc(chatsCollection, message);
  }

  public async getChats(roomId: string): Promise<void> {
    if (!this.user) return;

    const chatsCollection = collection(
      this.firestore,
      'rooms/' + roomId + '/chats'
    );
    const sortedQuery = query(chatsCollection, orderBy('timestamp', 'desc'));
    this.chats$ = collectionData(sortedQuery);
  }

  public async findMatchingUser(keyword: string): Promise<string> {
    const userDoc = await getDoc(doc(this.firestore, 'users/' + keyword));
    if (userDoc.exists()) {
      return keyword; // we were given an id
    }

    const usersCollection = collection(this.firestore, 'users');
    const userQuery = query(usersCollection, where('username', '==', keyword));
    const possibleMatches: User[] = (await firstValueFrom(
      collectionData(userQuery, { idField: 'id' })
    )) as User[];

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

      const userData = userDoc.data() as User;

      const joinedChat = {
        message: `${userData.username} Joined The Room. Say Hi!`,
        timestamp: serverTimestamp(),
        username: userData.username,
        userId: userDoc.id,
      } as Chat;

      updateDoc(ref, {
        rooms: arrayUnion(doc(this.firestore, 'rooms/' + roomDocument.id)),
      });

      addDoc(chatsCollection, joinedChat);
    });
  }

  public async deleteRoom(roomId: string) {
    const roomDocRef = doc(this.firestore, 'rooms/' + roomId);
    const roomDoc = await getDoc(roomDocRef);

    if (!roomDoc.exists()) return; // already gone

    const roomDocData = roomDoc.data() as Room;

    //check if allowed to delete
    if (roomDocData.users[0].id !== this.user?.id) {
      console.warn(
        `Not permitted. You Are: ${this.user?.id}, while owner is: ${roomDocData.users[0].id}`
      );

      throw new Error('Not Permitted');
    }

    roomDocData.users.forEach((user) => {
      updateDoc(user, {
        ['rooms']: arrayRemove(roomDocRef),
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

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.error('User not found');
      throw new Error('User not found');
    }

    const roomDoc = await getDoc(roomDocRef);
    if (!roomDoc.exists()) {
      console.error('Room not found');
      throw new Error('Room not found');
    }

    const users = (roomDoc.data() as Room).users;
    const username = (userDoc.data() as User).username;

    users.forEach((ref) => {
      if (ref.id === userId) {
        throw new Error(`User ${username} is already here.`);
      }
    });

    const joinedChat = {
      message: `${username} Joined The Room. Say Hi!`,
      timestamp: serverTimestamp(),
      username: username,
      userId: userId,
    } as Chat;
    addDoc(chatsCollection, joinedChat);

    updateDoc(userDocRef, { rooms: arrayUnion(roomDocRef) });
    updateDoc(roomDocRef, { users: arrayUnion(userDocRef) });
  }

  public async leaveRoom(roomId: string) {
    const roomDocRef = doc(this.firestore, 'rooms/' + roomId);
    const userDocRef = doc(this.firestore, 'users/' + this.user?.id);

    const chatsCollection = collection(
      this.firestore,
      'rooms',
      roomId,
      'chats'
    );

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.error('User not found');
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;

    const joinedChat = {
      message: `${userData.username} Left The Room. 😞`,
      timestamp: serverTimestamp(),
      username: userData.username,
      userId: userDoc.id,
    } as Chat;
    addDoc(chatsCollection, joinedChat);

    updateDoc(userDocRef, { rooms: arrayRemove(roomDocRef) });
    updateDoc(roomDocRef, { users: arrayRemove(userDocRef) });
    this.router.navigate(['']); // send user back home
  }

  async getProfilePicture(userId: string) {
    const userRef = doc(this.firestore, 'users/' + userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return '';

    const userData = userDoc.data() as User;

    return userData.photoURL;
  }
}

export interface Chat {
  message: string;
  timestamp: Timestamp | FieldValue;
  username: string;
  userId: string;
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
