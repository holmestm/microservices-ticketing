import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
  NotFoundError,
  validateRequest,
  requireAuth,
  NotAuthorizedError,
} from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param, body } from 'express-validator';
import { OrderDeletedPublisher } from '../events/publishers/order-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

let publisher: OrderDeletedPublisher;

let getPublisher = (): OrderDeletedPublisher => {
  if (!publisher) publisher = new OrderDeletedPublisher(natsWrapper.client);
  return publisher;
};

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,
  [
    param('id')
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage('Parameter must be a valid MongoDB Identifier'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError(req);
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    await order.remove();
    getPublisher().publish({
      id: order.id,
      ticketId: order.ticket.id,
    });

    res.send(order);
  }
);

export { router as deleteOrderRouter };
