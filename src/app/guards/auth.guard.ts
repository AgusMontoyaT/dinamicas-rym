import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, take, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { ServicioAuth } from '../services/servicio-auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(ServicioAuth);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    take(1),
    timeout(5000),
    catchError(() => of(null)),
    map((user) => (user ? true : router.createUrlTree(['/login'])))
  );
};
