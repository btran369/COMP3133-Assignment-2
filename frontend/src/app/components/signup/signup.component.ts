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
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { username, email, password, confirmPassword } = this.signupForm.value;

    if (password !== confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.graphqlService.signup({ username, email, password }).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success === 'true' && result.token && result.user) {
          this.authService.login(result.token, result.user);
          this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/employees']);
        } else {
          this.snackBar.open(result.message || 'Signup failed', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.message || 'Signup failed', 'Close', { duration: 4000 });
      }
    });
  }

  get f() { return this.signupForm.controls; }
}
