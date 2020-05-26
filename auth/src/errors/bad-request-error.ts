import { ErrorType, CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  reason = 'Error connecting to database';
  constructor(public message: string) {
    super(message);

    // because we are extending a builtin class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  statusCode = 400;
  serializeErrors(): ErrorType[] {
    return [{ message: this.message }];
  }
}
