import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  let tickets = await Ticket.find();

  if (!tickets) {
    tickets = [];
  }

  res.send(tickets);
});

export { router as showAllTicketsRouter };
