import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from "@angular/fire/auth";
import { routes } from './app.routes';

export const firebaseConfig = {
  apiKey: "AIzaSyB7MUgDCfOHwxFY21DQZ7bRioLNTcsyeZU",
  authDomain: "chatapp-c40e9.firebaseapp.com",
  projectId: "chatapp-c40e9",
  storageBucket: "chatapp-c40e9.firebasestorage.app",
  messagingSenderId: "411258806048",
  appId: "1:411258806048:web:aa6a5142807f3690f04145"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
};
