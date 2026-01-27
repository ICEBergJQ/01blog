import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 80vh;">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Register</h3>
            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" [(ngModel)]="user.username" name="username" required minlength="3" maxlength="50" placeholder="3-50 characters">
                <div *ngIf="user.username.length > 0 && user.username.length < 3" class="text-danger small mt-1">Username must be at least 3 characters.</div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" [(ngModel)]="user.email" name="email" required minlength="5" maxlength="100" placeholder="Max 100 characters" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" #email="ngModel" [class.is-invalid]="email.invalid && email.touched">
                <div class="invalid-feedback">Please enter a valid email address (e.g. user@example.com).</div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" [(ngModel)]="user.password" name="password" required minlength="8" maxlength="64" placeholder="8-64 characters" pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$" #password="ngModel" [class.is-invalid]="password.invalid && password.touched">
                <div class="invalid-feedback">Password must be 8-64 characters long, with 1 uppercase, 1 lowercase, and 1 number.</div>
              </div>
              <div class="mb-3">
                <label for="bio" class="form-label">Bio (Optional)</label>
                <textarea class="form-control" id="bio" [(ngModel)]="user.bio" name="bio" rows="3" maxlength="200" placeholder="Max 200 characters"></textarea>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">Register</button>
              </div>
              <div class="text-center mt-3">
                <a routerLink="/login">Already have an account? Login</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  user = { username: '', email: '', password: '', bio: '' };
  isSubmitting = false;

  constructor(
      private authService: AuthService, 
      private router: Router,
      private toastService: ToastService
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.authService.register(this.user).subscribe({
      next: () => {
          this.router.navigate(['/']);
          this.toastService.show('Registration successful! Welcome.', 'success');
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Registration failed. Try again.';
        this.toastService.show(msg, 'error');
      }
    });
  }
}