// Custom error classes for consistent error handling

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: string;

  constructor(message: string, statusCode: number, code: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', details);
  }
}
