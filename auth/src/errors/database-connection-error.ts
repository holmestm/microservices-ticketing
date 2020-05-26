import { ErrorType, CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to database';
  constructor() {
    super('DB Connection error');

    // because we are extending a builtin class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  statusCode = 500;
  serializeErrors(): ErrorType[] {
    return [{ message: this.reason }];
  }
}
