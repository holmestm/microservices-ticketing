import { Request, Response, NextFunction } from 'express';
import jwtServices from 'jsonwebtoken';

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

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jwt = req.session?.jwt;
  if (!jwt) {
    return next();
  }

  try {
    const payload = jwtServices.verify(
      jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
};
