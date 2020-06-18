import express, { Request, Response } from 'express';
import {
  requireAuth,
  ResourceNotFoundError,
  BadRequestError,
} from '@gravitaz/common';

import { validateRequest } from '@gravitaz/common';
import { body } from 'express-validator';
import { Order, OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Types as MongooseTypes } from 'mongoose';
import { Ticket } from '../models/ticket';

const EXPIRATION_WINDOW_SECONDS = 60 * 3; // 3 minutes

const router = express.Router();

let publisher: OrderCreatedPublisher;
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
      throw new ResourceNotFoundError('Ticket not found');
    }

    const existingOrder = await ticket.isReserved();
    if (existingOrder) {
      throw new BadRequestError('Ticket not available');
    }
    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Create new order and publish event
    const order = Order.build({
      userId: req.currentUser!.id,
      ticket,
      status: OrderStatus.Created,
      expiresAt: expiration,
    });
    await order.save();

    await getPublisher().publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
