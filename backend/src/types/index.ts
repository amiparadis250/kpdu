import { Request } from 'express';

export interface User {
  id: string;
  memberId: string;
  memberName: string;
  nationalId: string;
  mobileNumber: string;
  branch: string;
  email?: string;
  role: 'MEMBER' | 'ADMIN' | 'SUPERUSERADMIN';
  branchId?: string;
  isActive: boolean;
  hasVoted: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  memberId: string;
  role: string;
  branch: string;
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