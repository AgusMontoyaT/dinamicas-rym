import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServicioComun {
  readonly LIMITE_PERSONAJES = 826;

  // Observables
  tiempoAgotado$ = new Subject<void>();
  private detenerCrono$ = new Subject<void>();

  cronoActivo$ = new BehaviorSubject<boolean>(false);
  previsualizacionActiva$ = new BehaviorSubject<boolean>(false);
  tiempoFormateado$ = new BehaviorSubject<string>('00:00');
  private tiempoLimite$ = new BehaviorSubject<number>(1);
  private tiempoRestante$ = new BehaviorSubject<number>(0);
  private cuentaAtrasActiva$ = new BehaviorSubject<boolean>(false);

  // Variables internas
  segundosTotales = 0;
  contadorPrevisualizacion = 0;
  tiempoPrevisualizacionSignal = signal<number>(3);
  readonly tiempoPrevisualizacion = this.tiempoPrevisualizacionSignal.asReadonly();

  //////////////// GETTERS /////////////////

  get cronoActivo() { return this.cronoActivo$.asObservable(); }
  get previsualizacionActiva() { return this.previsualizacionActiva$.asObservable(); }
  get tiempoFormateado() { return this.tiempoFormateado$.asObservable(); }
  get tiempoLimite() { return this.tiempoLimite$.asObservable(); }
  get tiempoRestante() { return this.tiempoRestante$.asObservable(); }
  get cuentaAtrasActiva() { return this.cuentaAtrasActiva$.asObservable(); }

  get tiempoRestanteActual(): number {
    return this.tiempoRestante$.value;
  }

  /////////////// MÉTODOS //////////////////////

  iniciarSecuencia(tPrevisualizacion: number, tJuego: number): void {
    this.reiniciar();

    if (tPrevisualizacion > 0) {
      this.previsualizacionActiva$.next(true);
      this.contadorPrevisualizacion = tPrevisualizacion;
      this.tiempoPrevisualizacionSignal.set(tPrevisualizacion);
      this.tiempoFormateado$.next(this.formatearTiempo(tPrevisualizacion));

      const previsualizacion$ = timer(0, 1000).pipe(
        takeUntil(timer(tPrevisualizacion * 1000))
      );

      previsualizacion$.subscribe({
        next: (segundo) => {
          const restante = tPrevisualizacion - segundo - 1;
          this.contadorPrevisualizacion = restante;
          this.tiempoPrevisualizacionSignal.set(restante);
          this.tiempoFormateado$.next(this.formatearTiempo(restante));
        },
        complete: () => {
          this.previsualizacionActiva$.next(false);
          this.iniciarTiempoJuego(tJuego);
        }
      });
    } else {
      this.iniciarTiempoJuego(tJuego);
    }
  }

  private iniciarTiempoJuego(tJuego: number): void {
    this.cuentaAtrasActiva$.next(true);
    this.tiempoLimite$.next(tJuego);
    this.tiempoRestante$.next(tJuego);
    this.tiempoFormateado$.next(this.formatearTiempo(tJuego));

    const juego$ = timer(0, 1000).pipe(
      takeUntil(this.detenerCrono$)
    );

    juego$.subscribe(segundo => {
      const restante = tJuego - segundo - 1;
      if (restante <= 0) {
        this.tiempoRestante$.next(0);
        this.tiempoFormateado$.next('00:00');
        this.cuentaAtrasActiva$.next(false);
        this.detenerCrono$.next();
        this.tiempoAgotado$.next();
      } else {
        this.tiempoRestante$.next(restante);
        this.tiempoFormateado$.next(this.formatearTiempo(restante));
      }
    });
  }

  pausarCrono(): void {
    this.detenerCrono$.next();
    this.cronoActivo$.next(false);
  }

  reiniciar(): void {
    this.detenerCrono$.next();
    this.cronoActivo$.next(false);
    this.previsualizacionActiva$.next(false);
    this.cuentaAtrasActiva$.next(false);
    this.segundosTotales = 0;
    this.tiempoFormateado$.next('00:00');
    this.contadorPrevisualizacion = 3;
    this.tiempoPrevisualizacionSignal.set(3);
  }

  private formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    const minutosStr = minutos < 10 ? '0' + minutos : minutos.toString();
    const segsStr = segs < 10 ? '0' + segs : segs.toString();
    return `${minutosStr}:${segsStr}`;
  }

  barajarArray<T>(array: T[]): T[] {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  generarIdsAleatorios(cantidad: number): number[] {
    const ids: number[] = [];
    while (ids.length < cantidad) {
      const id = Math.floor(Math.random() * this.LIMITE_PERSONAJES) + 1;
      if (!ids.includes(id)) ids.push(id);
    }
    return ids;
  }
}
