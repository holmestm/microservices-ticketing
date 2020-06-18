import express, { Request, Response, query } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  let where: any = {};
  if (req.query?.all && req.query.all === 'N') {
    where = { orderId: { $exists: false } };
  }
  let tickets = await Ticket.find(where);
  if (!tickets) {
    tickets = [];
  }

  res.send(tickets);
});

export { router as showAllTicketsRouter };
