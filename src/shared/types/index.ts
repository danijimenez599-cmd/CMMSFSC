export type UserRole = "admin" | "supervisor" | "technician" | "viewer";

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  specialty: string | null;
  active: boolean;
}

export interface Location {
  id: string;
  parentId: string | null;
  name: string;
  code: string | null;
  level: number;
}

export type AppModule = 'dashboard' | 'assets' | 'workorders' | 'inventory' | 'pm' | 'settings';

export interface ToastPayload {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  