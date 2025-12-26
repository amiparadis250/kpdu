import { Request } from 'express';

export interface User {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'member' | 'admin' | 'superuseradmin';
  branchId?: string;
  isActive: boolean;
  hasVoted: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  memberId: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

export interface ExcelImportResult {
  success: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  total: number;
}