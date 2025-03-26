import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.interface';

export interface PinUpdateRequest {
  empId: number;
  empPin: string;
  managerId: number;
  managerPin: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8081';

  private httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'text/html, application/xhtml+xml, */*',
      'Content-Type': 'application/x-www-form-urlencoded',
       'responseType': 'text'  })
  };

  constructor(private http: HttpClient) { }

  getEmployeeById(empId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${empId}`);
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  updatePin(updateRequest: PinUpdateRequest): Observable<any> {

    return this.http.put(`${this.apiUrl}/employees/update-pin`, updateRequest);
  }
}
