import { ErrorType, CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
  reason = 'Request not authorized';
  constructor() {
    super('Request not authorized');

    // because we are extending a builtin class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
  statusCode = 401;
  serializeErrors(): ErrorType[] {
    return [{ message: this.reason }];
  }
}
