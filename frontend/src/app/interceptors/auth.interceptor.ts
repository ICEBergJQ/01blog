import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  let token = null;
  
  if (isPlatformBrowser(platformId)) {
      token = localStorage.getItem('token');
  }

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
              if (isPlatformBrowser(platformId)) {
                  localStorage.removeItem('token');
              }
              if (!router.url.includes('/login')) {
                  router.navigate(['/login']);
              }
          } else if (error.status === 403) {
              router.navigate(['/']);
          }
          return throwError(() => error);
      })
  );
};