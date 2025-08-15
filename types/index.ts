export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  location: string;
  avatar?: string;
  groups?: string[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  token: string;
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ContactSearchParams {
  query: string;
  department?: string;
  location?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
