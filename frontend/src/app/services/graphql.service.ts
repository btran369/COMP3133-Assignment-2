import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, EmployeeInput, UpdateEmployeeInput } from '../models/employee.model';
import { AuthPayload, LoginInput, SignupInput } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  private apiUrl = environment.graphqlUrl;
  private uploadUrl = environment.uploadUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private query<T>(queryStr: string, variables: any = {}): Observable<T> {
    return this.http.post<{ data: T; errors?: any[] }>(
      this.apiUrl,
      { query: queryStr, variables },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.errors && response.errors.length > 0) {
          throw new Error(response.errors[0].message);
        }
        return response.data;
      })
    );
  }

  // ─── Photo Upload (REST) ────────────────────────────

  uploadPhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ url: string }>(
      this.uploadUrl,
      formData,
      { headers: this.getAuthHeaders() }
    ).pipe(map(res => res.url));
  }

  // ─── Auth ───────────────────────────────────────────

  login(input: LoginInput): Observable<AuthPayload> {
    const q = `
      query Login($input: LoginInput!) {
        Login(input: $input) {
          success
          message
          token
          user {
            _id
            username
            email
          }
        }
      }
    `;
    return this.query<{ Login: AuthPayload }>(q, { input }).pipe(map(d => d.Login));
  }

  signup(input: SignupInput): Observable<AuthPayload> {
    const q = `
      mutation Signup($input: SignupInput!) {
        Signup(input: $input) {
          success
          message
          token
          user {
            _id
            username
            email
          }
        }
      }
    `;
    return this.query<{ Signup: AuthPayload }>(q, { input }).pipe(map(d => d.Signup));
  }

  // ─── Employees ──────────────────────────────────────

  getAllEmployees(): Observable<Employee[]> {
    const q = `
      query {
        GetAllEmployees {
          _id
          first_name
          last_name
          email
          gender
          designation
          salary
          date_of_joining
          department
          employee_photo
          created_at
          updated_at
        }
      }
    `;
    return this.query<{ GetAllEmployees: Employee[] }>(q).pipe(map(d => d.GetAllEmployees));
  }

  getEmployeeById(eid: string): Observable<Employee> {
    const q = `
      query SearchEmployeeByEid($eid: ID!) {
        SearchEmployeeByEid(eid: $eid) {
          _id
          first_name
          last_name
          email
          gender
          designation
          salary
          date_of_joining
          department
          employee_photo
          created_at
          updated_at
        }
      }
    `;
    return this.query<{ SearchEmployeeByEid: Employee }>(q, { eid }).pipe(map(d => d.SearchEmployeeByEid));
  }

  searchEmployees(designation?: string, department?: string): Observable<Employee[]> {
    const q = `
      query SearchEmployeeByDesignationOrDepartment($designation: String, $department: String) {
        SearchEmployeeByDesignationOrDepartment(designation: $designation, department: $department) {
          _id
          first_name
          last_name
          email
          gender
          designation
          salary
          date_of_joining
          department
          employee_photo
          created_at
          updated_at
        }
      }
    `;
    return this.query<{ SearchEmployeeByDesignationOrDepartment: Employee[] }>(q, { designation, department })
      .pipe(map(d => d.SearchEmployeeByDesignationOrDepartment));
  }

  addEmployee(input: EmployeeInput, photoFile?: File | null): Observable<{ success: string; message: string; employee: Employee }> {
    const mutation = `
      mutation AddEmployee($input: EmployeeInput!) {
        AddEmployee(input: $input) {
          success
          message
          employee {
            _id
            first_name
            last_name
            email
            gender
            designation
            salary
            date_of_joining
            department
            employee_photo
          }
        }
      }
    `;

    if (photoFile) {
      return this.uploadPhoto(photoFile).pipe(
        switchMap(photoUrl => {
          const inputWithPhoto = { ...input, employee_photo: photoUrl };
          return this.query<{ AddEmployee: { success: string; message: string; employee: Employee } }>(mutation, { input: inputWithPhoto });
        }),
        map(d => d.AddEmployee)
      );
    }

    return this.query<{ AddEmployee: { success: string; message: string; employee: Employee } }>(mutation, { input })
      .pipe(map(d => d.AddEmployee));
  }

  updateEmployee(eid: string, input: UpdateEmployeeInput, photoFile?: File | null): Observable<{ success: string; message: string; employee: Employee }> {
    const mutation = `
      mutation UpdateEmployeeByEid($eid: ID!, $input: UpdateEmployeeInput!) {
        UpdateEmployeeByEid(eid: $eid, input: $input) {
          success
          message
          employee {
            _id
            first_name
            last_name
            email
            gender
            designation
            salary
            date_of_joining
            department
            employee_photo
          }
        }
      }
    `;

    if (photoFile) {
      return this.uploadPhoto(photoFile).pipe(
        switchMap(photoUrl => {
          const inputWithPhoto = { ...input, employee_photo: photoUrl };
          return this.query<{ UpdateEmployeeByEid: { success: string; message: string; employee: Employee } }>(mutation, { eid, input: inputWithPhoto });
        }),
        map(d => d.UpdateEmployeeByEid)
      );
    }

    return this.query<{ UpdateEmployeeByEid: { success: string; message: string; employee: Employee } }>(mutation, { eid, input })
      .pipe(map(d => d.UpdateEmployeeByEid));
  }

  deleteEmployee(eid: string): Observable<{ success: string; message: string }> {
    const q = `
      mutation DeleteEmployeeByEid($eid: ID!) {
        DeleteEmployeeByEid(eid: $eid) {
          success
          message
        }
      }
    `;
    return this.query<{ DeleteEmployeeByEid: { success: string; message: string } }>(q, { eid })
      .pipe(map(d => d.DeleteEmployeeByEid));
  }
}
