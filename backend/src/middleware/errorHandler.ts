import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(`❌ Error [${req.method} ${req.url}]:`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
