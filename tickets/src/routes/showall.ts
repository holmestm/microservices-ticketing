import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError, validateRequest } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param } from 'express-validator';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  let tickets = await Ticket.find();
  console.log('GET all tickets');

  if (!tickets) {
    tickets = [];
  }

  res.send(tickets);
});

export { router as showAllTicketsRouter };
