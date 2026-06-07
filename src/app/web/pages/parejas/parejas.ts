import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioParejas } from '../../../services/servicio-parejas';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioComun } from '../../../services/servicio-comun';
import { Header } from '../../components/header/header';
import { Tablero } from '../../components/tablero/tablero';
import { Confeti } from '../../components/confeti/confeti';
import { CONFIG_PAREJAS, getSiguienteDificultad } from '../../../common/dificultad-config';
import { TranslateModule } from '@ngx-translate/core';
import { faArrowsRotate, faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-parejas',
  standalone: true,
  imports: [CommonModule, Header, Tablero, Confeti, TranslateModule, FaIconComponent],
  templateUrl: './parejas.html',
  styleUrl: './parejas.css',
})
export class Parejas implements OnInit {
  readonly servicioComun: ServicioComun = inject(ServicioComun);
  private readonly servicioParejas: ServicioParejas = inject(ServicioParejas);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // Observables del servicio
  readonly estadoJuego$ = this.servicioParejas.estadoJuego;
  readonly movimientos$ = this.servicioParejas.movimientos;
  readonly fallos$ = this.servicioParejas.fallos;
  readonly cartas$ = this.servicioParejas.cartas;
  readonly cartasCargadas$ = this.servicioParejas.cartasCargadas;
  readonly errorCarga$ = this.servicioParejas.errorCarga$;

  // Cronómetro
  readonly tiempoFormateado$ = this.servicioComun.tiempoFormateado;
  readonly tiempoRestante$ = this.servicioComun.tiempoRestante;
  readonly tiempoLimite$ = this.servicioComun.tiempoLimite;
  readonly previsualizacionActiva$ = this.servicioComun.previsualizacionActiva;

  dificultadId: string = '';
  nombreJuego: string = 'CLONES';
  mostrarComoJugar = false;

  get limiteFallos(): number { return this.servicioParejas.limiteFallosActual; }
  get nombreDificultad(): string { return this.servicioParejas.nombreDificultadActual; }
  get siguienteDificultad(): string | null { return getSiguienteDificultad(this.dificultadId); }

  // ICONOS
  faArrowsRotate = faArrowsRotate;
  faXMark = faXmark;
  faArrowRight = faArrowRight;

  @HostListener('document:keydown.escape')
  onEscape() { this.cerrarComoJugar(); }

  abrirComoJugar() { this.mostrarComoJugar = true; }
  cerrarComoJugar() { this.mostrarComoJugar = false; }

  irSiguienteNivel() {
    const sig = this.siguienteDificultad;
    if (sig) this.router.navigate(['/parejas', sig]);
  }

  ngOnInit() {
    const dificultadP = this.route.snapshot.params['dificultad'];
    if (!CONFIG_PAREJAS[dificultadP]) {
      this.router.navigate(['/']);
      return;
    }
    this.dificultadId = dificultadP;
    this.servicioParejas.iniciarPartida(dificultadP);
  }

  onCartaClick(indice: number) {
    this.servicioParejas.controlarClicCarta(indice);
  }

  reiniciarPartida() {
    this.servicioParejas.iniciarPartida(this.dificultadId);
  }

  salirPartida() {
    this.router.navigate(['/']);
  }

}
