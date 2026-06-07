import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Personaje, Tarjeta } from '../common/interfaz-rym';
import { CONFIG_PAREJAS } from '../common/dificultad-config';
import { ServicioApi } from './servicio-api';
import { ServicioPuntuaciones } from './servicio-puntuaciones';
import { ServicioComun } from './servicio-comun';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ServicioParejas implements OnDestroy {
  private readonly apiService = inject(ServicioApi);
  private readonly servicioPuntuaciones = inject(ServicioPuntuaciones);
  private readonly auth = inject(Auth);
  private readonly servicioComun = inject(ServicioComun);

  private dificultadNombre: string = '';

  private readonly movimientos$ = new BehaviorSubject<number>(0);
  private readonly fallos$ = new BehaviorSubject<number>(0);
  private readonly cartas$ = new BehaviorSubject<Tarjeta[]>([]);
  private readonly cartasCargadas$ = new BehaviorSubject<boolean>(false);
  private readonly estadoJuego$ = new BehaviorSubject<'empezando' | 'jugando' | 'ganado' | 'perdido'>('empezando');
  readonly errorCarga$ = new BehaviorSubject<string | null>(null);

  private limiteFallos: number = 0;
  private cartaSeleccionada1: Tarjeta | null = null;
  private cartaSeleccionada2: Tarjeta | null = null;
  private tableroBloqueado: boolean = false;
  private idC1: number | null = null;
  private idC2: number | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly limpieza$ = new Subject<void>();

  constructor() {
    this.servicioComun.tiempoAgotado$
      .pipe(takeUntil(this.limpieza$))
      .subscribe(() => {
        if (this.estadoJuego$.value === 'jugando') {
          this.estadoJuego$.next('perdido');
          this.tableroBloqueado = true;
        }
      });
  }

  get estadoJuego() { return this.estadoJuego$.asObservable(); }
  get estadoActual() { return this.estadoJuego$.value; }
  get movimientos() { return this.movimientos$.asObservable(); }
  get fallos() { return this.fallos$.asObservable(); }
  get cartas() { return this.cartas$.asObservable(); }
  get cartasCargadas() { return this.cartasCargadas$.asObservable(); }
  get limiteFallosActual() { return this.limiteFallos; }
  get nombreDificultadActual() { return this.dificultadNombre; }

  async iniciarPartida(dificultadId: string): Promise<void> {
    const config = CONFIG_PAREJAS[dificultadId];
    if (!config) return;

    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }

    this.dificultadNombre = config.nombre;
    this.limiteFallos = config.limiteFallos;

    this.estadoJuego$.next('empezando');
    this.cartasCargadas$.next(false);
    this.cartas$.next([]);
    this.movimientos$.next(0);
    this.fallos$.next(0);
    this.errorCarga$.next(null);
    this.tableroBloqueado = false;
    this.resetearTurno();

    this.servicioComun.iniciarSecuencia(config.tiempoPreview, config.tiempoLimite);

    try {
      const ids = this.servicioComun.generarIdsAleatorios(config.nivel);
      const personajes = await lastValueFrom(this.apiService.getPersonajesById(ids));
      const mazo = this.servicioComun.barajarArray(this.crearMazo(personajes));

      this.cartas$.next(mazo);
      this.estadoJuego$.next('jugando');
      this.cartasCargadas$.next(true);
    } catch {
      this.errorCarga$.next('Error al cargar los personajes');
    }
  }

  controlarClicCarta(idC: number) {
    if (this.estadoJuego$.value !== 'jugando') return;
    if (this.tableroBloqueado) return;

    const cartasActuales = this.cartas$.value;
    const carta = cartasActuales[idC];
    if (carta.isEmparejada || carta.isDesactivada || carta.isVisible) return;

    if (this.idC1 === null) {
      this.idC1 = idC;
      this.cartaSeleccionada1 = carta;
      this.actualizarCarta(idC, { isVisible: true });
    } else if (this.idC2 === null && this.idC1 !== idC) {
      this.idC2 = idC;
      this.cartaSeleccionada2 = carta;
      this.actualizarCarta(idC, { isVisible: true });
      this.movimientos$.next(this.movimientos$.value + 1);
      this.comprobarPareja();
    }
  }

  ngOnDestroy(): void {
    if (this.pendingTimer !== null) clearTimeout(this.pendingTimer);
    this.limpieza$.next();
    this.limpieza$.complete();
  }

  private crearMazo(personajes: Personaje[]): Tarjeta[] {
    const mazo: Tarjeta[] = [];
    let idContador = 0;
    personajes.filter(p => !!p.image).forEach(p => {
      const base = { idPers: p.id, namePers: p.name, imagePers: p.image, isVisible: false, isEmparejada: false, isDesactivada: false, isFallo: false, isAcierto: false };
      mazo.push({ ...base, id: idContador++ });
      mazo.push({ ...base, id: idContador++ });
    });
    return mazo;
  }

  private actualizarCarta(idC: number, cambios: Partial<Tarjeta>) {
    const cartas = this.cartas$.value;
    cartas[idC] = { ...cartas[idC], ...cambios };
    this.cartas$.next([...cartas]);
  }

  private comprobarPareja() {
    if (!this.cartaSeleccionada1 || !this.cartaSeleccionada2) return;
    this.tableroBloqueado = true;

    if (this.cartaSeleccionada1.idPers === this.cartaSeleccionada2.idPers) {
      this.actualizarCarta(this.idC1!, { isEmparejada: true, isAcierto: true });
      this.actualizarCarta(this.idC2!, { isEmparejada: true, isAcierto: true });
      this.comprobarVictoria();
      setTimeout(() => {
        this.resetearTurno();
        this.tableroBloqueado = false;
      }, 500);
    } else {
      const nuevosFallos = this.fallos$.value + 1;
      this.fallos$.next(nuevosFallos);
      this.actualizarCarta(this.idC1!, { isFallo: true });
      this.actualizarCarta(this.idC2!, { isFallo: true });

      if (nuevosFallos >= this.limiteFallos) {
        this.estadoJuego$.next('perdido');
        this.servicioComun.pausarCrono();
        this.tableroBloqueado = false;
        return;
      }

      this.pendingTimer = setTimeout(() => {
        this.actualizarCarta(this.idC1!, { isVisible: false, isFallo: false });
        this.actualizarCarta(this.idC2!, { isVisible: false, isFallo: false });
        this.resetearTurno();
        this.tableroBloqueado = false;
        this.pendingTimer = null;
      }, 1000);
    }
  }

  private comprobarVictoria() {
    const todasEmparejadas = this.cartas$.value.every(carta => carta.isEmparejada);
    if (todasEmparejadas) {
      this.estadoJuego$.next('ganado');
      this.tableroBloqueado = false;
      this.servicioComun.pausarCrono();
      this.guardarPuntuacion();
    }
  }

  private guardarPuntuacion() {
    const user = this.auth.currentUser;
    if (!user) return;
    this.servicioPuntuaciones.guardarPuntuacion({
      uid: user.uid,
      nombre: user.displayName ?? 'Anónimo',
      juego: 'parejas',
      dificultad: this.dificultadNombre,
      movimientos: this.movimientos$.value,
      tiempo: this.servicioComun.tiempoRestanteActual,
    });
  }

  private resetearTurno() {
    this.cartaSeleccionada1 = null;
    this.cartaSeleccionada2 = null;
    this.idC1 = null;
    this.idC2 = null;
  }
}
