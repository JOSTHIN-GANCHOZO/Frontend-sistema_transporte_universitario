import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();

  if (token) {
    const requestConToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(requestConToken);
  }

  return next(req);
};
