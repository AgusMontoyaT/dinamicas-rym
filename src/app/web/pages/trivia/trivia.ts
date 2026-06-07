import { Component, HostListener, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioTrivia } from '../../../services/servicio-trivia';
import { ServicioComun } from '../../../services/servicio-comun';
import { CONFIG_TRIVIA, getSiguienteDificultad } from '../../../common/dificultad-config';
import { Header } from '../../components/header/header';
import { Confeti } from '../../components/confeti/confeti';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-trivia',
  imports: [AsyncPipe, Header, Confeti, FaIconComponent, TranslateModule],
  templateUrl: './trivia.html',
  styleUrl: './trivia.css',
})
export class Trivia implements OnInit {
  readonly servicioComun: ServicioComun = inject(ServicioComun);
  private readonly servicioTrivia: ServicioTrivia = inject(ServicioTrivia);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly estadoJuego$ = this.servicioTrivia.estadoJuego$;
  readonly preguntaActual$ = this.servicioTrivia.preguntaActual$;
  readonly puntuacion$ = this.servicioTrivia.puntuacion$;
  readonly fallos$ = this.servicioTrivia.fallos$;
  readonly cargando$ = this.servicioTrivia.cargando$;
  readonly errorCarga$ = this.servicioTrivia.errorCarga$;

  readonly tiempoFormateado$ = this.servicioComun.tiempoFormateado;
  readonly tiempoRestante$ = this.servicioComun.tiempoRestante;
  readonly tiempoLimite$ = this.servicioComun.tiempoLimite;

  dificultadId: string = '';
  nombreJuego: string = 'TRIVIA';
  mostrarComoJugar = false;

  get limiteFallos(): number { return this.servicioTrivia.limiteFallosValue; }
  get nombreDificultad(): string { return this.servicioTrivia.nombreDificultadActual; }
  get siguienteDificultad(): string | null { return getSiguienteDificultad(this.dificultadId); }

  faArrowsRotate = faArrowsRotate;
  faXMark = faXmark;
  faArrowRight = faArrowRight;

  @HostListener('document:keydown.escape')
  onEscape() { this.cerrarComoJugar(); }

  abrirComoJugar() { this.mostrarComoJugar = true; }
  cerrarComoJugar() { this.mostrarComoJugar = false; }

  irSiguienteNivel() {
    const sig = this.siguienteDificultad;
    if (sig) this.router.navigate(['/trivia', sig]);
  }

  ngOnInit() {
    const dificultadP = this.route.snapshot.params['dificultad'];
    if (!CONFIG_TRIVIA[dificultadP]) {
      this.router.navigate(['/']);
      return;
    }
    this.dificultadId = dificultadP;
    this.servicioTrivia.iniciarJuego(dificultadP);
  }

  responder(opcion: string) {
    this.servicioTrivia.validarRespuesta(opcion);
  }

  reiniciarPartida() {
    // iniciarJuego ya llama a reiniciar internamente; no hay doble reset
    this.servicioTrivia.iniciarJuego(this.dificultadId);
  }

  salirPartida() {
    this.servicioTrivia.reiniciar();
    this.router.navigate(['/']);
  }

}
