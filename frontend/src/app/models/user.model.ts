export interface User {
  _id: string;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthPayload {
  success: string;
  message: string;
  token?: string;
  user?: User;
}

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
}

export interface SignupInput {
  username: string;
  email: string;
  password: string;
}
