
export type UserRole = 'admin' | 'interviewer';

export interface User {
  username: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
