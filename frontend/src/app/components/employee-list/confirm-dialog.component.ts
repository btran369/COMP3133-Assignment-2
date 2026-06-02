import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon">
        <mat-icon>warning_amber</mat-icon>
      </div>
      <h2>Delete Employee</h2>
      <p>Are you sure you want to delete <strong>{{ data.name }}</strong>? This action cannot be undone.</p>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="warn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          Delete
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 24px;
      text-align: center;
      background: #1a1a2e;
      border-radius: 16px;

      .dialog-icon {
        width: 56px; height: 56px;
        border-radius: 50%;
        background: rgba(255, 61, 113, 0.15);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;

        mat-icon {
          color: #ff3d71;
          font-size: 28px;
          width: 28px; height: 28px;
        }
      }

      h2 {
        color: #fff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 700;
        margin-bottom: 8px;
      }

      p {
        color: #8888aa;
        font-size: 14px;
        margin-bottom: 24px;

        strong { color: #e0e0e0; }
      }

      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: center;

        button {
          border-radius: 10px;
          padding: 0 24px;
          height: 40px;

          &[mat-stroked-button] {
            border-color: #2a2a4a;
            color: #8888aa;
          }
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  onCancel(): void { this.dialogRef.close(false); }
  onConfirm(): void { this.dialogRef.close(true); }
}
