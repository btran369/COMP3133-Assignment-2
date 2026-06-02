export interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
}

export interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  designation?: string;
  salary?: number;
  date_of_joining?: string;
  department?: string;
}
