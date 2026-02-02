import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const toastService = inject(ToastService);
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
          if (isPlatformBrowser(platformId)) {
              if (error.status === 401) {
                  // 401 Unauthorized (Expired/Invalid Token) -> Logout
                  const currentPath = window.location.pathname;
                  if (currentPath !== '/login' && currentPath !== '/register') {
                      localStorage.removeItem('token');
                      window.location.reload();
                  }
              } else if (error.status === 403) {
                  // 403 Forbidden
                  if (error.error && error.error.message === "User is disabled") {
                      // Banned -> Logout
                      localStorage.removeItem('token');
                      window.location.reload();
                  } else {
                      // Role Mismatch -> Access Denied (Stay logged in)
                      toastService.show('Access Denied: You do not have permission.', 'error');
                      router.navigate(['/']);
                  }
              }
          }
          return throwError(() => error);
      })
  );
};