import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Auth } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esPeticionLogin = req.url.includes('/auth/login');

      if (error.status === 401 && !esPeticionLogin) {
        auth.logout();
        router.navigate(['/login']);
      } else if (error.status === 403 && !esPeticionLogin) {
        router.navigate(['/main']);
      }

      return throwError(() => error);
    })
  );
};
