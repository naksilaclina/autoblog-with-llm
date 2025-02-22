export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'AUTH001',
  FORBIDDEN: 'AUTH002',
  NOT_FOUND: 'COMMON001',
  VALIDATION_ERROR: 'COMMON002',
  INTERNAL_ERROR: 'COMMON003',
  RATE_LIMIT_EXCEEDED: 'API001',
  INVALID_INPUT: 'API002',
} as const; 