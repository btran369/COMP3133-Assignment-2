import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GraphqlService } from '../../services/graphql.service';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent {
  employeeForm: FormGroup;
  loading = false;
  photoPreview: string | null = null;
  photoFile: File | null = null;

  genders = ['Male', 'Female', 'Other'];
  departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support'];
  designations = ['Software Engineer', 'Senior Software Engineer', 'Designer', 'Senior Designer',
    'Manager', 'Director', 'VP', 'Analyst', 'Lead', 'Intern', 'Consultant'];

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      salary: ['', [Validators.required, Validators.min(1000)]],
      date_of_joining: ['', [Validators.required]],
      department: ['', [Validators.required]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        this.snackBar.open('Only PNG or JPEG images are allowed', 'Close', { duration: 3000 });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }
      this.photoFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.photoPreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreview = null;
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.employeeForm.value;
    const input = {
      ...formValue,
      salary: Number(formValue.salary),
      date_of_joining: new Date(formValue.date_of_joining).toISOString()
    };

    this.graphqlService.addEmployee(input, this.photoFile).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success === 'true') {
          this.snackBar.open('Employee added successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/employees']);
        } else {
          this.snackBar.open(result.message || 'Failed to add employee', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.message || 'Failed to add employee', 'Close', { duration: 4000 });
      }
    });
  }

  get f() { return this.employeeForm.controls; }
}
