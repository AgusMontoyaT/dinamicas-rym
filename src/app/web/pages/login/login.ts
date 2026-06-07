import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicioAuth } from '../../../services/servicio-auth';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(ServicioAuth);
  private router = inject(Router);
  private translate = inject(TranslateService);

  modoRegistro = false;
  nombre = '';
  email = '';
  password = '';
  error = '';
  cargando = false;

  toggleModo() {
    this.modoRegistro = !this.modoRegistro;
    this.error = '';
  }

  async submit() {
    this.error = '';
    this.cargando = true;
    try {
      if (this.modoRegistro) {
        await this.auth.register(this.email, this.password, this.nombre);
      } else {
        await this.auth.login(this.email, this.password);
      }
      this.router.navigate(['/inicio']);
    } catch (e: any) {
      this.error = this.traducirError(e.code);
    } finally {
      this.cargando = false;
    }
  }

  private traducirError(code: string): string {
    const errores: Record<string, string> = {
      'auth/email-already-in-use': 'LOGIN.ERROR_EMAIL_EN_USO',
      'auth/invalid-email':        'LOGIN.ERROR_EMAIL_INVALIDO',
      'auth/weak-password':        'LOGIN.ERROR_PASSWORD_DEBIL',
      'auth/invalid-credential':   'LOGIN.ERROR_CREDENCIAL_INVALIDA',
      'auth/user-not-found':       'LOGIN.ERROR_USUARIO_NO_ENCONTRADO',
    };
    const key = errores[code] ?? 'LOGIN.ERROR_DESCONOCIDO';
    return this.translate.instant(key);
  }
}
