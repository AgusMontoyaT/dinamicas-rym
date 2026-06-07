import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Portal } from '../../components/portal/portal';
import { faBurst, faPersonRunning, faLanguage, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ServicioAuth } from '../../../services/servicio-auth';

@Component({
  selector: 'app-inicio',
  imports: [FaIconComponent, TranslateModule, Portal, AsyncPipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  private servicioAuth = inject(ServicioAuth);
  readonly translate = inject(TranslateService);
  readonly router = inject(Router);

  currentUser$ = this.servicioAuth.currentUser$;

  dificultadesLeyenda = [
    { clase: 'superfacil' },
    { clase: 'facil' },
    { clase: 'medio' },
    { clase: 'dificil' },
    { clase: 'superdificil' },
  ];

  mostrarModal = false;
  mostrarPortal = false;
  idiomaMenuAbierto = false;
  private juegoDestino = 'parejas';
  private dificultadPendiente = '';

  faPersonRunning = faPersonRunning;
  faBurst = faBurst;
  faLanguage = faLanguage;
  faRightFromBracket = faRightFromBracket;

  constructor() {
    this.translate.use(localStorage.getItem('idioma_preferido') || 'es');
  }

  navegarConPortal(juego: string, clase: string) {
    this.juegoDestino = juego;
    this.dificultadPendiente = clase;
    this.mostrarPortal = true;
  }

  onPortalCompletado() {
    this.mostrarPortal = false;
    this.router.navigate(['/' + this.juegoDestino, this.dificultadPendiente]);
  }

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  logout() {
    this.servicioAuth.logout();
  }

  cambiarIdioma(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('idioma_preferido', lang);
    this.idiomaMenuAbierto = false;
  }

  toggleIdiomaMenu() {
    this.idiomaMenuAbierto = !this.idiomaMenuAbierto;
  }
}
