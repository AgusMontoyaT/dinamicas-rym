import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Puntuacion } from '../common/interfaz-rym';

@Injectable({ providedIn: 'root' })
export class ServicioPuntuaciones {
  private firestore = inject(Firestore);
  private coleccion = collection(this.firestore, 'puntuaciones');

  guardarPuntuacion(p: Omit<Puntuacion, 'fecha'>): Promise<void> {
    return addDoc(this.coleccion, { ...p, fecha: Timestamp.now() }).then(
      () => undefined
    );
  }

  getRanking(juego: string, dificultad: string): Observable<Puntuacion[]> {
    const q = query(
      this.coleccion,
      where('juego', '==', juego),
      where('dificultad', '==', dificultad)
    );

    return from(getDocs(q)).pipe(
      map((snap) =>
        snap.docs
          .map((doc) => {
            const data = doc.data();
            return {
              ...data,
              fecha: (data['fecha'] as Timestamp).toDate(),
            } as Puntuacion;
          })
          .sort((a, b) => a.movimientos - b.movimientos || b.tiempo - a.tiempo)
          .slice(0, 10)
      )
    );
  }
}
