import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GraphqlService } from '../../services/graphql.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { usernameOrEmail, password } = this.loginForm.value;

    this.graphqlService.login({ usernameOrEmail, password }).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success === 'true' && result.token && result.user) {
          this.authService.login(result.token, result.user);
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/employees']);
        } else {
          this.snackBar.open(result.message || 'Invalid credentials', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.message || 'Login failed', 'Close', { duration: 4000 });
      }
    });
  }

  get f() { return this.loginForm.controls; }
}
