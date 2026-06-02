import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GraphqlService } from '../../services/graphql.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee.model';
import { SalaryPipe } from '../../pipes/salary.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatTooltipModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule,
    SalaryPipe, TruncatePipe
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  searchType: 'all' | 'department' | 'designation' = 'all';
  searchValue = '';
  displayedColumns: string[] = ['photo', 'name', 'email', 'designation', 'department', 'salary', 'actions'];

  departments: string[] = [];
  designations: string[] = [];
  filteredSuggestions: string[] = [];

  constructor(
    private graphqlService: GraphqlService,
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.graphqlService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.departments = [...new Set(data.map(e => e.department))].sort();
        this.designations = [...new Set(data.map(e => e.designation))].sort();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.message || 'Failed to load employees', 'Close', { duration: 4000 });
      }
    });
  }

  onSearchTypeChange(): void {
    this.searchValue = '';
    if (this.searchType === 'all') {
      this.filteredEmployees = this.employees;
      this.filteredSuggestions = [];
    } else {
      this.updateSuggestions();
    }
  }

  onSearchInputChange(): void {
    this.updateSuggestions();
    // Live-filter locally as the user types (instant feedback)
    if (!this.searchValue.trim()) {
      this.filteredEmployees = this.employees;
      return;
    }
    const val = this.searchValue.toLowerCase();
    if (this.searchType === 'department') {
      this.filteredEmployees = this.employees.filter(e => e.department.toLowerCase().includes(val));
    } else {
      this.filteredEmployees = this.employees.filter(e => e.designation.toLowerCase().includes(val));
    }
  }

  updateSuggestions(): void {
    const source = this.searchType === 'department' ? this.departments : this.designations;
    if (!this.searchValue.trim()) {
      this.filteredSuggestions = source;
    } else {
      const val = this.searchValue.toLowerCase();
      this.filteredSuggestions = source.filter(s => s.toLowerCase().includes(val));
    }
  }

  onSearch(): void {
    if (this.searchType === 'all' || !this.searchValue.trim()) {
      this.filteredEmployees = this.employees;
      return;
    }

    this.loading = true;
    const dept = this.searchType === 'department' ? this.searchValue.trim() : undefined;
    const desig = this.searchType === 'designation' ? this.searchValue.trim() : undefined;

    this.graphqlService.searchEmployees(desig, dept).subscribe({
      next: (data) => {
        this.filteredEmployees = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.message || 'Search failed', 'Close', { duration: 4000 });
      }
    });
  }

  clearSearch(): void {
    this.searchType = 'all';
    this.searchValue = '';
    this.filteredSuggestions = [];
    this.filteredEmployees = this.employees;
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: string): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  deleteEmployee(emp: Employee): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { name: `${emp.first_name} ${emp.last_name}` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.graphqlService.deleteEmployee(emp._id).subscribe({
          next: () => {
            this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
            this.loadEmployees();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Delete failed', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  getInitials(emp: Employee): string {
    return (emp.first_name.charAt(0) + emp.last_name.charAt(0)).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
