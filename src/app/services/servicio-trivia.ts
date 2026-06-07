import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { PreguntaTrivia } from '../common/interfaz-rym';
import { CONFIG_TRIVIA } from '../common/dificultad-config';
import { ServicioApi } from './servicio-api';
import { ServicioPuntuaciones } from './servicio-puntuaciones';
import { ServicioComun } from './servicio-comun';

@Injectable({ providedIn: 'root' })
export class ServicioTrivia implements OnDestroy {
  private readonly apiService = inject(ServicioApi);
  private readonly servicioPuntuaciones = inject(ServicioPuntuaciones);
  private readonly auth = inject(Auth);
  private readonly servicioComun = inject(ServicioComun);
  private readonly limpieza$ = new Subject<void>();

  readonly estadoJuego$ = new BehaviorSubject<'empezando' | 'jugando' | 'ganado' | 'perdido'>('empezando');
  readonly preguntaActual$ = new BehaviorSubject<PreguntaTrivia | null>(null);
  readonly puntuacion$ = new BehaviorSubject<number>(0);
  readonly fallos$ = new BehaviorSubject<number>(0);
  readonly cargando$ = new BehaviorSubject<boolean>(false);
  readonly errorCarga$ = new BehaviorSubject<string | null>(null);

  private limiteFallos = 0;
  private dificultadNombre = '';

  constructor() {
    this.servicioComun.tiempoAgotado$
      .pipe(takeUntil(this.limpieza$))
      .subscribe(() => {
        if (this.estadoJuego$.value === 'jugando') {
          this.estadoJuego$.next('ganado');
          this.guardarPuntuacion();
        }
      });
  }

  iniciarJuego(dificultadId: string): void {
    const config = CONFIG_TRIVIA[dificultadId];
    if (!config) return;

    this.dificultadNombre = config.nombre;
    this.limiteFallos = config.limiteFallos;

    this.puntuacion$.next(0);
    this.fallos$.next(0);
    this.errorCarga$.next(null);
    this.preguntaActual$.next(null);
    this.estadoJuego$.next('jugando');

    this.servicioComun.iniciarSecuencia(config.tiempoPreview, config.tiempoLimite);
    this.siguientePregunta();
  }

  async validarRespuesta(nombre: string): Promise<void> {
    if (this.estadoJuego$.value !== 'jugando') return;
    const pregunta = this.preguntaActual$.value;
    if (!pregunta || pregunta.respondida) return;

    const esCorrecto = nombre === pregunta.correcta;
    this.preguntaActual$.next({ ...pregunta, respondida: true, esCorrecto, seleccionada: nombre });

    if (esCorrecto) {
      this.puntuacion$.next(this.puntuacion$.value + 1);
    } else {
      const nuevosFallos = this.fallos$.value + 1;
      this.fallos$.next(nuevosFallos);
      if (nuevosFallos >= this.limiteFallos) {
        this.estadoJuego$.next('perdido');
        return;
      }
    }

    setTimeout(() => this.siguientePregunta(), 900);
  }

  reiniciar(): void {
    this.estadoJuego$.next('empezando');
    this.preguntaActual$.next(null);
    this.puntuacion$.next(0);
    this.fallos$.next(0);
    this.errorCarga$.next(null);
    this.servicioComun.reiniciar();
  }

  get limiteFallosValue(): number {
    return this.limiteFallos;
  }

  get nombreDificultadActual(): string {
    return this.dificultadNombre;
  }

  ngOnDestroy(): void {
    this.limpieza$.next();
    this.limpieza$.complete();
  }

  private async siguientePregunta(): Promise<void> {
    this.cargando$.next(true);
    try {
      const ids = this.servicioComun.generarIdsAleatorios(4);
      const personajes = await lastValueFrom(this.apiService.getPersonajesById(ids));
      if (!personajes || personajes.length < 2) return;

      const conImagen = personajes.filter(p => !!p.image);
      if (conImagen.length < 2) return;
      const correcto = conImagen[0];
      const opciones = this.servicioComun.barajarArray(conImagen.map(p => p.name));

      this.preguntaActual$.next({
        personaje: correcto,
        opciones,
        correcta: correcto.name,
        respondida: false,
        esCorrecto: null,
      });
      this.errorCarga$.next(null);
    } catch {
      this.errorCarga$.next('Error al cargar la pregunta. Inténtalo de nuevo.');
    } finally {
      this.cargando$.next(false);
    }
  }

  private guardarPuntuacion(): void {
    const user = this.auth.currentUser;
    if (!user) return;
    this.servicioPuntuaciones.guardarPuntuacion({
      uid: user.uid,
      nombre: user.displayName ?? 'Anónimo',
      juego: 'trivia',
      dificultad: this.dificultadNombre,
      movimientos: this.fallos$.value,
      tiempo: this.puntuacion$.value,
    });
  }
}
