import express, { Request, Response } from 'express';
import { requireAuth, OrderStatus, InvalidTicketError } from '@gravitaz/common';

import { validateRequest } from '@gravitaz/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Types as MongooseTypes } from 'mongoose';
import { Ticket } from '../models/ticket';

const router = express.Router();
let publisher: OrderCreatedPublisher;

const EXPIRY = 15;

let getPublisher = (): OrderCreatedPublisher => {
  if (!publisher) publisher = new OrderCreatedPublisher(natsWrapper.client);
  return publisher;
};

const addExpiry = (date: Date, mins: number): Date => {
  date.setDate(date.getDate() + mins);
  return date;
};

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage('ticketId must be a valid database id'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new InvalidTicketError('Ticket not found');
    }

    const existingOrder = await ticket.isReserved();
    if (existingOrder) {
      throw new InvalidTicketError('Ticket already reserved/processed');
    }

    // Create new order and publish event
    const order = Order.build({
      userId: req.currentUser!.id,
      ticket,
      status: OrderStatus.Created,
      expiresAt: addExpiry(new Date(), EXPIRY), // 15 minutes
    });
    await order.save();

    await getPublisher().publish({
      id: order.id,
      userId: order.userId,
      ticketId: ticket.id,
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
