import { Response } from 'express';

export type ErrorType = {
  message: any;
  field?: string;
};

export interface ISerializableError {
  statusCode: number;
  serializeErrors(): ErrorType[];
}

export function isSerializableError(object: any): object is ISerializableError {
  return 'serializeErrors' in object && 'statusCode' in object;
}

export abstract class CustomError extends Error implements ISerializableError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  abstract statusCode: number;
  abstract serializeErrors(): ErrorType[];
  errResponse = (res: Response): void => {
    res.status(this.statusCode).send(this.serializeErrors());
  };
}
