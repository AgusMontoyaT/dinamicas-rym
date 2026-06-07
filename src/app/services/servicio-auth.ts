import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import type { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicioAuth {
  private auth = inject(Auth);

  currentUser$: Observable<User | null> = user(this.auth);

  register(email: string, password: string, nombre: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      (cred) => updateProfile(cred.user, { displayName: nombre })
    );
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
