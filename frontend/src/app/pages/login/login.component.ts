import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Login</h3>
            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" [(ngModel)]="credentials.username" name="username" required maxlength="50" placeholder="Max 50 characters">
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" [(ngModel)]="credentials.password" name="password" required maxlength="64" placeholder="Max 64 characters">
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
              <div class="text-center mt-3">
                <a routerLink="/register">Don't have an account? Register</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = { username: '', password: '' };

  constructor(
      private authService: AuthService, 
      private router: Router,
      private toastService: ToastService
  ) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
          this.router.navigate(['/']);
          this.toastService.show('Welcome back!', 'success');
      },
      error: (err) => {
        let msg = "Login failed";
        if (err.status === 403 && err.error && err.error.message === "User is disabled") {
             msg = "Your account has been banned.";
        } else if (err.status === 401) {
             msg = "Invalid credentials";
        }
        this.toastService.show(msg, 'error');
      }
    });
  }
}
