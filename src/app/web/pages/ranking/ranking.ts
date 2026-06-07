import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServicioPuntuaciones } from '../../../services/servicio-puntuaciones';
import { Puntuacion } from '../../../common/interfaz-rym';
import { nombresDificultad } from '../../../common/enums';

@Component({
  selector: 'app-ranking',
  imports: [AsyncPipe, DatePipe, TranslateModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css',
})
export class Ranking implements OnInit {
  private servicioPuntuaciones = inject(ServicioPuntuaciones);
  router = inject(Router);

  juegos = [
    { id: 'parejas', label: '🃏 Parejas' },
    { id: 'intruso', label: '🕵️ Intruso' },
    { id: 'trivia', label: '❓ Trivia' },
  ];

  dificultades: string[] = Object.values(nombresDificultad);

  juegoSeleccionado = 'parejas';
  dificultadSeleccionada = this.dificultades[0];
  ranking$: Observable<Puntuacion[]> = of([]);

  ngOnInit() {
    this.cargarRanking();
  }

  seleccionarJuego(juego: string) {
    this.juegoSeleccionado = juego;
    this.cargarRanking();
  }

  seleccionarDificultad(d: string) {
    this.dificultadSeleccionada = d;
    this.cargarRanking();
  }

  cargarRanking() {
    this.ranking$ = this.servicioPuntuaciones
      .getRanking(this.juegoSeleccionado, this.dificultadSeleccionada)
      .pipe(catchError(() => of([])));
  }

  formatearTiempo(segundos: number): string {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
