import express, { Request, Response } from 'express';
import { requireAuth } from '@gravitaz/common';

import { validateRequest } from '@gravitaz/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
let publisher: TicketCreatedPublisher;

let getPublisher = (): TicketCreatedPublisher => {
  if (!publisher) publisher = new TicketCreatedPublisher(natsWrapper.client);
  return publisher;
};

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title')
      .isString()
      .not()
      .isEmpty()
      .withMessage('Title must be a non empty string'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    await getPublisher().publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
