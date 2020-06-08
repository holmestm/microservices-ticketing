import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@gravitaz/common';
import { deleteOrderRouter } from './routes/delete';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { showAllOrdersRouter } from './routes';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(deleteOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(showAllOrdersRouter);

app.use('*', async (req: Request, res: Response) => {
  throw new NotFoundError(req);
});
app.use(errorHandler);

export { app };
