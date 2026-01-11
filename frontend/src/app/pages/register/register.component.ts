import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" [(ngModel)]="user.username" name="username" required maxlength="50" placeholder="Max 50 characters">
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" [(ngModel)]="user.email" name="email" required maxlength="100" #email="ngModel" [class.is-invalid]="email.invalid && email.touched">
                <div class="invalid-feedback">Please enter a valid email address.</div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" [(ngModel)]="user.password" name="password" required maxlength="100" pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$" #password="ngModel" [class.is-invalid]="password.invalid && password.touched">
                <div class="invalid-feedback">Password must be at least 8 characters long, with 1 uppercase, 1 lowercase, and 1 number.</div>
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
  error = '';
  isSubmitting = false;

  constructor(
      private authService: AuthService, 
      private router: Router
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.authService.register(this.user).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Registration failed. Try again.';
        console.error(err);
      }
    });
  }
}