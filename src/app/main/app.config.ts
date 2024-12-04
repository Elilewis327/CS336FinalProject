import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
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
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
};
