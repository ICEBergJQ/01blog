import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .toast {
        color: white !important;
        opacity: 1 !important;
    }
    .toast-body {
        font-size: 1rem;
        padding: 1rem;
    }
  `],
  template: `
    <div class="toast-container position-fixed end-0 p-3" style="top: 80px; z-index: 1100;">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="toast show align-items-center text-white border-0 mb-2 shadow-lg" 
           [ngClass]="{
             'bg-success': toast.type === 'success',
             'bg-danger': toast.type === 'error',
             'bg-warning': toast.type === 'warning',
             'bg-info': toast.type === 'info'
           }"
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body fw-bold">
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="toastService.remove(toast.id)" aria-label="Close"></button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
