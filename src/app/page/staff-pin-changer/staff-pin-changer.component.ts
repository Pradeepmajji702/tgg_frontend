import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService, PinUpdateRequest } from '../../services/employee.service';
import { Employee } from '../../models/employee.interface';
import { Router } from '@angular/router';

interface SimplifiedEmployee {
  empId: number;
  empFirstName: string;
  empMiddleName: string;
  empLastName: string;
  level: number;
  pin: string;
}

@Component({
  selector: 'app-staff-pin-changer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-pin-changer.component.html',
  styleUrl: './staff-pin-changer.component.scss'
})
export class StaffPinChangerComponent implements OnInit {
  pinChangeForm: FormGroup;
  staffList: SimplifiedEmployee[] = [];
  isLoading = false;
  errorMessage = '';
  apiMessage = '';
  isError = false;
  currentDate: Date;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {
    this.currentDate = new Date();
    this.pinChangeForm = this.fb.group({
      selectedStaff: ['', Validators.required],
      newPin: ['', [Validators.required,Validators.pattern('^[0-9]{4,5}$')]],
      managerPin: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      isManager: [{ value: false, disabled: true }]
    });

    // Subscribe to selectedStaff changes to handle manager checkbox and PIN validation
    this.pinChangeForm.get('selectedStaff')?.valueChanges.subscribe(staffId => {
      this.handleStaffSelection(staffId);
    });

    // Subscribe to newPin changes for validation
    this.pinChangeForm.get('newPin')?.valueChanges.subscribe(pin => {
      this.validatePin(pin);
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        // Transform and store only required fields
        this.staffList = employees.map(emp => ({
          empId: emp.empId,
          empFirstName: emp.empFirstName,
          empMiddleName: emp.empMiddleName,
          empLastName: emp.empLastName,
          level: emp.role.level,
          pin: emp.pin
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Failed to load employee list';
        this.isLoading = false;
      }
    });
  }

  getFullName(employee: SimplifiedEmployee): string {
    return `${employee.empFirstName} ${employee.empMiddleName} ${employee.empLastName} (${employee.empId})`;
  }

  handleStaffSelection(staffId: string): void {
    const selectedStaff = this.staffList.find(staff => staff.empId.toString() === staffId);
    const isManagerControl = this.pinChangeForm.get('isManager');
    const newPinControl = this.pinChangeForm.get('newPin');

    if (selectedStaff) {
      if (selectedStaff.level >= 3) {
        isManagerControl?.enable();
      } else {
        isManagerControl?.disable();
        isManagerControl?.setValue(false);
      }

      // Clear PIN when staff changes
      newPinControl?.setValue('');
    }
  }

  validatePin(pin: any): void {
    const newPinControl = this.pinChangeForm.get('newPin');
    const staffLevel = this.getSelectedStaffLevel();

    if (!newPinControl || !pin) return;

    // Convert pin to string
    const pinString = pin.toString();

    // console.log('clean pin ', pinString, typeof(pinString), pinString.length);
    // Remove any non-digit characters
    const cleanPin = pinString.replace(/\D/g, '');
    // console.log('clean pin ', cleanPin, typeof(cleanPin));

    if (staffLevel >= 3) {
        // For level 3 or higher, exactly 5 digits required
        if (cleanPin.length > 5) {
            newPinControl.setValue(cleanPin.slice(0, 5), { emitEvent: false });
        } else {
            newPinControl.setValue(cleanPin, { emitEvent: false });
        }
        newPinControl.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{5}$')
        ]);
    } else {
        // For level below 3, exactly 4 digits required
        if (cleanPin.length > 4) {
            newPinControl.setValue(cleanPin.slice(0, 4), { emitEvent: false });
        } else {
            newPinControl.setValue(cleanPin, { emitEvent: false });
        }
        newPinControl.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{4}$')
        ]);
    }

    newPinControl.updateValueAndValidity({ emitEvent: false });
  }

  generateRandomPin(): void {
    const staffLevel = this.getSelectedStaffLevel();
    const min = staffLevel >= 3 ? 10000 : 1000;
    const max = staffLevel >= 3 ? 99999 : 9999;
    const randomPin = Math.floor(Math.random() * (max - min + 1)) + min;
    this.pinChangeForm.patchValue({
      newPin: randomPin.toString()
    });
  }

  getPinErrorMessage(): string {
    const control = this.pinChangeForm.get('newPin');
    const staffLevel = this.getSelectedStaffLevel();

    if (control?.errors?.['required']) {
      return 'PIN is required';
    }
    if (control?.errors?.['pattern']) {
      return staffLevel >= 3
        ? 'PIN must be exactly 5 digits'
        : 'PIN must be exactly 4 digits';
    }
    return '';
  }

  onChangePin(): void {
    if (this.pinChangeForm.valid) {
        const formValue = this.pinChangeForm.value;
        const selectedStaff = this.staffList.find(staff => staff.empId.toString() === formValue.selectedStaff);

        if (!selectedStaff) {
            this.setApiMessage('Selected staff not found', true);
            return;
        }

        const updateRequest: PinUpdateRequest = {
            empId: selectedStaff.empId,
            empPin: formValue.newPin.toString(),
            managerId: parseInt(localStorage.getItem("managerId") || '0'),
            managerPin: formValue.managerPin.toString()
        };
        // console.log(updateRequest);

        console.log('level', localStorage.getItem('level'));
        console.log('selected staff', selectedStaff.level);

        const storedLevel = parseInt(localStorage.getItem('level') || '0', 10); // Get level from localStorage
        const selectedLevel = selectedStaff.level; // Get selected staff level

        // Check if stored level is greater than selected staff level
        if (storedLevel > selectedLevel) {
            this.employeeService.updatePin(updateRequest).subscribe({
                next: (response: any) => {
                    try {
                        const res = typeof response === 'string' ? { message: response } : response;
                        // console.log("Response received:", res);

                        if (res.message?.toLowerCase().includes('success')) {
                            this.setApiMessage('PIN updated successfully', false);
                            this.pinChangeForm.reset();
                        }
                        this.loadEmployees();
                    } catch (error) {
                        console.error('Error parsing response:', error);
                        this.setApiMessage('Unexpected response format', true);
                    }
                },
                error: (error) => {
                    console.error('Error updating PIN:', error);
                    if (error.status === 403) {
                        this.setApiMessage('Unauthorized: Manager PIN incorrect', true);
                    } else {
                        this.setApiMessage(error.error?.message || 'Failed to update PIN', true);
                    }
                }
            });
        } else {
            console.error("Unauthorized access for this user");
            this.setApiMessage("Unauthorized access for this user", true); // Optionally, display an error message to the user
        }
    }
  }

  private setApiMessage(message: string, isError: boolean): void {
    this.apiMessage = message;
    this.isError = isError;
    // Clear message after 5 seconds
    setTimeout(() => {
      this.apiMessage = '';
      this.isError = false;
    }, 5000);
  }

  onQuit(): void {
    this.router.navigate(['/login']);
  }

  getSelectedStaffId(): string {
    return this.pinChangeForm.get('selectedStaff')?.value || '';
  }

  getSelectedStaffLevel(): number {
    // debugger
    const staffId = this.getSelectedStaffId();
    const selectedStaff = this.staffList.find(staff => staff.empId.toString() === staffId);
    // console.log('selected staff level',selectedStaff?.level)
    return selectedStaff?.level || 0;
  }

  getCurrentDate(): string {
    const date = new Date();
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}${this.getOrdinalSuffix(day)} ${month} ${year}`;
  }

  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}
