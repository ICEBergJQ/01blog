import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Added RouterModule
import { AuthService } from '../../services/auth.service';

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
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" [(ngModel)]="credentials.username" name="username" required maxlength="50">
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" [(ngModel)]="credentials.password" name="password" required maxlength="100">
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
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        if (err.status === 403 && err.error && err.error.message === "User is disabled") {
             this.error = "Your account has been banned.";
        } else if (err.status === 401) {
             this.error = "Invalid credentials";
        } else {
             this.error = "Login failed. " + (err.error?.message || "");
        }
        console.error(err);
      }
    });
  }
}
