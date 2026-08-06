import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

export const cambioPasswordGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.requiereCambio()) {
    return router.createUrlTree(['/cambiar-password']);
  }

  return true;
};