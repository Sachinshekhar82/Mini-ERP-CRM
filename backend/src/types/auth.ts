import { Request } from 'express';

export type UserRole = 'ADMIN' | 'OPERATIONS' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: Date | string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
