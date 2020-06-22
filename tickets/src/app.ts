import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  RouteNotFoundError,
  currentUser,
} from '@gravitaz/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { showAllTicketsRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'prod',
  })
);
app.use(currentUser);

app.use(updateTicketRouter);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);

app.use('*', async (req: Request, res: Response) => {
  throw new RouteNotFoundError(req);
});
app.use(errorHandler);

export { app };
