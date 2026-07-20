export type Role = "employee" | "agent";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
