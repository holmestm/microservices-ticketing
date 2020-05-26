import { ErrorType, CustomError } from './custom-error';
import { Request } from 'express';

export class NotFoundError extends CustomError {
  constructor(req: Request) {
    super(`Route not found for ${req.method}.${req.path}`);

    // because we are extending a builtin class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  statusCode = 404;
  serializeErrors(): ErrorType[] {
    return [{ message: this.message }];
  }
}
