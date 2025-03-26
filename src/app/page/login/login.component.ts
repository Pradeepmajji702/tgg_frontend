import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.interface';

interface StoredEmployeeData {
  empId: number;
  pin: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService
  ) {
    this.loginForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.pattern('^[0-9]{1,5}$')]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const employeeId = parseInt(this.loginForm.get('employeeId')?.value);

      this.employeeService.getEmployeeById(employeeId).subscribe({
        next: (employee: Employee) => {
          // Store only empId and pin
          const storedData: StoredEmployeeData = {
            empId: employee.empId,
            pin: employee.pin
          };
          sessionStorage.setItem('employeeData', JSON.stringify(storedData));
          localStorage.setItem('managerId', JSON.stringify(employee.empId));
          this.router.navigate(['/staff-pin-changer']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = 'Invalid employee ID or employee not found';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  getErrorMessage(): string {
    const control = this.loginForm.get('employeeId');
    if (control?.hasError('required')) {
      return 'Employee ID is required';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 5-digit Employee ID';
    }
    return '';
  }
}
