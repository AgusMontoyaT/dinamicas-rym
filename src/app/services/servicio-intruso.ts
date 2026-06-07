import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { EstadoJugando, GrupoIntruso, Personaje, Tarjeta } from '../common/interfaz-rym';
import { CONFIG_INTRUSO } from '../common/dificultad-config';
import { ServicioApi } from './servicio-api';
import { ServicioPuntuaciones } from './servicio-puntuaciones';
import { ServicioComun } from './servicio-comun';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ServicioIntruso implements OnDestroy {
  private readonly apiService = inject(ServicioApi);
  private readonly servicioPuntuaciones = inject(ServicioPuntuaciones);
  private readonly auth = inject(Auth);
  private readonly servicioComun = inject(ServicioComun);

  private dificultadNombre: string = '';

  private readonly pistaDisponible$ = new BehaviorSubject<boolean>(true);
  private readonly fallos$ = new BehaviorSubject<number>(0);
  private readonly cartas$ = new BehaviorSubject<Tarjeta[]>([]);
  private readonly cartasCargadas$ = new BehaviorSubject<boolean>(false);
  private readonly tableroBloqueado$ = new BehaviorSubject<boolean>(false);
  readonly errorCarga$ = new BehaviorSubject<string | null>(null);

  readonly clickEnBloqueado$ = new Subject<void>();

  private readonly estadoJuego$ = new BehaviorSubject<'empezando' | 'jugando' | 'ganado' | 'perdido'>('empezando');
  private readonly estadoJugando$ = new BehaviorSubject<EstadoJugando>({
    grupoActual: null, puntuacion: 0, rondasJugador: 0
  });

  private limiteFallos: number = 0;
  private personajesRonda: number = 0;
  private rondasTotales: number = 0;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly limpieza$ = new Subject<void>();

  private grupoActual: GrupoIntruso | null = null;
  private intrusoId: number | null = null;
  private _gridAjuste: string = '';

  private readonly condicionMap: Record<string, { comunKey: string; intrusoKey: string }> = {
    alive:  { comunKey: 'INTRUSO.CAT_ALIVE',  intrusoKey: 'INTRUSO.CAT_DEAD'   },
    dead:   { comunKey: 'INTRUSO.CAT_DEAD',   intrusoKey: 'INTRUSO.CAT_ALIVE'  },
    male:   { comunKey: 'INTRUSO.CAT_MALE',   intrusoKey: 'INTRUSO.CAT_FEMALE' },
    female: { comunKey: 'INTRUSO.CAT_FEMALE', intrusoKey: 'INTRUSO.CAT_MALE'   },
    alien:  { comunKey: 'INTRUSO.CAT_ALIEN',  intrusoKey: 'INTRUSO.CAT_HUMAN'  },
    human:  { comunKey: 'INTRUSO.CAT_HUMAN',  intrusoKey: 'INTRUSO.CAT_ALIEN'  },
  };

  constructor() {
    this.servicioComun.tiempoAgotado$
      .pipe(takeUntil(this.limpieza$))
      .subscribe(() => {
        if (this.estadoJuego$.value === 'jugando') {
          this.estadoJuego$.next('perdido');
          this.guardarPuntuacion();
        }
      });
  }

  get estadoJuego() { return this.estadoJuego$.asObservable(); }
  get estadoActual() { return this.estadoJuego$.value; }
  get tableroBloqueado() { return this.tableroBloqueado$.asObservable(); }
  get pistaDisponible() { return this.pistaDisponible$.asObservable(); }
  get fallos() { return this.fallos$.asObservable(); }
  get cartas() { return this.cartas$.asObservable(); }
  get cartasCargadas() { return this.cartasCargadas$.asObservable(); }
  get estadoJugando() { return this.estadoJugando$.asObservable(); }
  get limiteFallosActual() { return this.limiteFallos; }
  get nombreDificultadActual() { return this.dificultadNombre; }
  get rondasTotalesActual() { return this.rondasTotales; }
  get gridAjusteActual() { return this._gridAjuste; }

  getCondicionComunKey(caractComun: string): string {
    return this.condicionMap[caractComun]?.comunKey ?? 'INTRUSO.CAT_' + caractComun.toUpperCase();
  }

  getCondicionIntrusoKey(caractComun: string): string {
    return this.condicionMap[caractComun]?.intrusoKey ?? 'INTRUSO.CAT_' + caractComun.toUpperCase();
  }

  iniciarJuego(dificultadId: string): void {
    const config = CONFIG_INTRUSO[dificultadId];
    if (!config) return;

    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }

    this.dificultadNombre = config.nombre;
    this.limiteFallos = config.limiteFallos;
    this.personajesRonda = config.personajesRonda;
    this.rondasTotales = config.rondasTotales;
    this._gridAjuste = config.gridAjuste;

    this.fallos$.next(0);
    this.estadoJuego$.next('jugando');
    this.cartasCargadas$.next(false);
    this.tableroBloqueado$.next(true);
    this.errorCarga$.next(null);
    this.estadoJugando$.next({ grupoActual: null, puntuacion: 0, rondasJugador: 0 });
    this.pistaDisponible$.next(true);

    this.servicioComun.iniciarSecuencia(config.tiempoPreview, config.tiempoLimite);
    this.siguienteRonda();
  }

  validarSeleccion(idCarta: number) {
    if (this.estadoJuego$.value !== 'jugando') return;
    if (this.tableroBloqueado$.value) {
      this.clickEnBloqueado$.next();
      return;
    }

    const carta = this.cartas$.value[idCarta];
    const estadoActual = this.estadoJugando$.value;

    if (carta.idPers === this.intrusoId) {
      this.tableroBloqueado$.next(true);
      const nuevaPuntuacion = estadoActual.puntuacion + 1;
      this.estadoJugando$.next({ ...estadoActual, puntuacion: nuevaPuntuacion });

      if (estadoActual.rondasJugador >= this.rondasTotales) {
        this.estadoJuego$.next('ganado');
        this.guardarPuntuacion();
      } else {
        this.pendingTimer = setTimeout(() => {
          this.pendingTimer = null;
          this.siguienteRonda();
        }, 1000);
      }
    } else {
      this.tableroBloqueado$.next(true);
      this.fallos$.next(this.fallos$.value + 1);

      if (this.fallos$.value >= this.limiteFallos) {
        this.estadoJuego$.next('perdido');
      } else {
        this.pendingTimer = setTimeout(() => {
          this.pendingTimer = null;
          this.siguienteRonda();
        }, 1000);
      }
    }
  }

  usarPista() {
    if (this.pistaDisponible$.value && this.grupoActual) {
      this.pistaDisponible$.next(false);
    }
  }

  ngOnDestroy(): void {
    if (this.pendingTimer !== null) clearTimeout(this.pendingTimer);
    this.limpieza$.next();
    this.limpieza$.complete();
  }

  private async siguienteRonda() {
    try {
      const condicion = this.elegirCondicion();

      const personajesNormales = await this.obtenerPersonajes(condicion.filtro, condicion.comun, this.personajesRonda - 1);
      const arrayIntrusos = await this.obtenerPersonajes(condicion.filtro, condicion.intruso, 1);
      const personajeIntruso = arrayIntrusos[0];

      const mezclados = this.servicioComun.barajarArray([...personajesNormales, personajeIntruso]);

      this.intrusoId = personajeIntruso.id;
      this.grupoActual = {
        personajes: mezclados,
        caractComun: condicion.comun,
        intruso: personajeIntruso,
        pista: condicion.texto
      };

      this.cartas$.next(this.convertirGrupoCartas(mezclados));
      this.cartasCargadas$.next(true);
      this.pistaDisponible$.next(true);
      this.errorCarga$.next(null);

      this.estadoJugando$.next({
        ...this.estadoJugando$.value,
        grupoActual: this.grupoActual,
        rondasJugador: this.estadoJugando$.value.rondasJugador + 1
      });
      this.tableroBloqueado$.next(false);
    } catch {
      this.errorCarga$.next('Error al cargar la ronda. Inténtalo de nuevo.');
    }
  }

  private convertirGrupoCartas(personajes: Personaje[]): Tarjeta[] {
    return personajes.map((p, i) => ({
      id: i, idPers: p.id, namePers: p.name, imagePers: p.image,
      isVisible: true, isEmparejada: false, isDesactivada: false, isFallo: false, isAcierto: false
    }));
  }

  async obtenerPersonajes(filtro: string, valor: string, cantidad: number): Promise<Personaje[]> {
    const personajes = await lastValueFrom(this.apiService.getPersonajesPorFiltro(filtro, valor, 1));
    if (!personajes || personajes.length === 0) return [];
    const conImagen = personajes.filter(p => !!p.image);
    return this.seleccionarAleatorios(conImagen, cantidad);
  }

  private seleccionarAleatorios<T>(array: T[], cantidad: number): T[] {
    const copia = [...array];
    const resultado: T[] = [];
    for (let i = 0; i < cantidad && copia.length > 0; i++) {
      const indice = Math.floor(Math.random() * copia.length);
      resultado.push(copia[indice]);
      copia.splice(indice, 1);
    }
    return resultado;
  }

  private guardarPuntuacion() {
    const user = this.auth.currentUser;
    if (!user) return;
    this.servicioPuntuaciones.guardarPuntuacion({
      uid: user.uid,
      nombre: user.displayName ?? 'Anónimo',
      juego: 'intruso',
      dificultad: this.dificultadNombre,
      movimientos: this.fallos$.value,
      tiempo: this.servicioComun.tiempoRestanteActual,
    });
  }

  elegirCondicion() {
    const CONDICIONES = [
      { filtro: 'status',  comun: 'alive',  intruso: 'dead',   texto: '' },
      { filtro: 'status',  comun: 'dead',   intruso: 'alive',  texto: '' },
      { filtro: 'gender',  comun: 'male',   intruso: 'female', texto: '' },
      { filtro: 'gender',  comun: 'female', intruso: 'male',   texto: '' },
      { filtro: 'species', comun: 'alien',  intruso: 'human',  texto: '' },
    ];
    return CONDICIONES[Math.floor(Math.random() * CONDICIONES.length)];
  }
}
