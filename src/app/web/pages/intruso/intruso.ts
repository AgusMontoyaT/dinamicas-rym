import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioIntruso } from '../../../services/servicio-intruso';
import { ServicioComun } from '../../../services/servicio-comun';
import { CONFIG_INTRUSO, getSiguienteDificultad } from '../../../common/dificultad-config';
import { combineLatest, map } from 'rxjs';
import { Carta } from '../../components/carta/carta';
import { Header } from '../../components/header/header';
import { Confeti } from '../../components/confeti/confeti';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-intruso',
  imports: [AsyncPipe, Carta, Header, Confeti, FaIconComponent, TranslateModule],
  templateUrl: './intruso.html',
  styleUrl: './intruso.css',
})
export class Intruso implements OnInit {
  readonly servicioComun: ServicioComun = inject(ServicioComun);
  private readonly servicioIntruso: ServicioIntruso = inject(ServicioIntruso);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // Observables del servicio
  readonly pistaDisponible$ = this.servicioIntruso.pistaDisponible;
  readonly fallos$ = this.servicioIntruso.fallos;
  readonly cartas$ = this.servicioIntruso.cartas;
  readonly cartasCargadas$ = this.servicioIntruso.cartasCargadas;
  readonly estadoJuego$ = this.servicioIntruso.estadoJuego;
  readonly estadoJugando$ = this.servicioIntruso.estadoJugando;
  readonly errorCarga$ = this.servicioIntruso.errorCarga$;

  // Cronómetro
  readonly tiempoFormateado$ = this.servicioComun.tiempoFormateado;
  readonly tiempoRestante$ = this.servicioComun.tiempoRestante;
  readonly tiempoLimite$ = this.servicioComun.tiempoLimite;

  readonly puntuacion$ = this.estadoJugando$.pipe(map(e => e?.puntuacion ?? 0));
  readonly rondasJugador$ = this.estadoJugando$.pipe(map(e => e?.rondasJugador ?? 0));

  readonly tableroBloqueado$ = combineLatest([
    this.servicioIntruso.tableroBloqueado,
    this.servicioComun.previsualizacionActiva,
  ]).pipe(map(([bloqueado, preview]) => bloqueado || preview));

  mostrarToastBloqueado = false;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  dificultadId: string = '';
  nombreJuego: string = 'INTRUSO';

  readonly categorias = ['alive', 'dead', 'male', 'female', 'alien', 'human'];

  getCategoriaEmoji(key: string): string {
    const emojis: Record<string, string> = {
      alive: '❤️', dead: '💀', male: '👨', female: '👩', alien: '👽', human: '🧑',
    };
    return emojis[key] ?? '';
  }

  get limiteFallos(): number { return this.servicioIntruso.limiteFallosActual; }
  get nombreDificultad(): string { return this.servicioIntruso.nombreDificultadActual; }
  get rondasTotales(): number { return this.servicioIntruso.rondasTotalesActual; }
  get gridAjuste(): string { return this.servicioIntruso.gridAjusteActual; }
  get siguienteDificultad(): string | null { return getSiguienteDificultad(this.dificultadId); }

  faArrowsRotate = faArrowsRotate;
  faXMark = faXmark;
  faArrowRight = faArrowRight;

  irSiguienteNivel() {
    const sig = this.siguienteDificultad;
    if (sig) this.router.navigate(['/intruso', sig]);
  }

  ngOnInit() {
    const dificultadP = this.route.snapshot.params['dificultad'];
    if (!CONFIG_INTRUSO[dificultadP]) {
      this.router.navigate(['/']);
      return;
    }
    this.dificultadId = dificultadP;
    this.servicioIntruso.iniciarJuego(dificultadP);
  }

  onCartaClick(indice: number) {
    this.servicioIntruso.validarSeleccion(indice);
  }

  onCartaBloqueadaClick() {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.mostrarToastBloqueado = true;
    this.toastTimeout = setTimeout(() => {
      this.mostrarToastBloqueado = false;
    }, 1800);
  }

  usarPista() {
    this.servicioIntruso.usarPista();
  }

  reiniciarPartida() {
    this.servicioIntruso.iniciarJuego(this.dificultadId);
  }

  cambiarDificultad() {
    this.router.navigate(['/']);
  }

  getCondicionComunKey(caractComun: string): string {
    return this.servicioIntruso.getCondicionComunKey(caractComun);
  }

  getCondicionIntrusoKey(caractComun: string): string {
    return this.servicioIntruso.getCondicionIntrusoKey(caractComun);
  }

}
