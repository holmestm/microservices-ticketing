import { Request, Response, NextFunction } from 'express';
import jwtService from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const bearerToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.headers?.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    const jwt = req.headers.authorization.split(' ')[1];
    try {
      const payload = jwtService.verify(
        jwt,
        process.env.JWT_KEY!
      ) as UserPayload;
      req.currentUser = payload;
    } catch (err) {}
  }

  next();
};
