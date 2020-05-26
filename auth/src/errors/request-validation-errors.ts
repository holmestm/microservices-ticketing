import { ValidationError } from 'express-validator';
import { ErrorType, CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  constructor(public errors: ValidationError[]) {
    super('RequestValidationError');

    // because we are extending a builtin class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  statusCode: number = 400;
  serializeErrors(): ErrorType[] {
    return this.errors.map((err: ValidationError) => {
      return { message: err.msg, field: err.param };
    });
  }
}
