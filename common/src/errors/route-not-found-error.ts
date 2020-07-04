import { CustomError } from './custom-error';
import { Request } from 'express';

export class RouteNotFoundError extends CustomError {
  statusCode = 404;

  constructor(req: Request) {
    super(`Route not found ${req.method}.${req.path}`);

    Object.setPrototypeOf(this, RouteNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}
