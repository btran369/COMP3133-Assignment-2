import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GraphqlService } from '../../services/graphql.service';
import { Employee } from '../../models/employee.model';
import { SalaryPipe } from '../../pipes/salary.pipe';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    SalaryPipe
  ],
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.scss']
})
export class EmployeeViewComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.graphqlService.getEmployeeById(id).subscribe({
        next: (emp) => {
          this.employee = emp;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.message || 'Employee not found', 'Close', { duration: 4000 });
          this.router.navigate(['/employees']);
        }
      });
    }
  }

  getInitials(): string {
    if (!this.employee) return '';
    return (this.employee.first_name.charAt(0) + this.employee.last_name.charAt(0)).toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
