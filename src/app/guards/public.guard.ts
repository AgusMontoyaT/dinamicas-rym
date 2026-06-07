import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, take, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { ServicioAuth } from '../services/servicio-auth';

export const publicGuard: CanActivateFn = () => {
  const servicioAuth = inject(ServicioAuth);
  const router = inject(Router);

  return servicioAuth.currentUser$.pipe(
    take(1),
    timeout(3000),
    catchError(() => of(null)),
    map((usuario) => (usuario ? router.createUrlTree(['/inicio']) : true))
  );
};
