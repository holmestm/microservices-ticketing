import express, { Request, Response } from 'express';
import {
  requireAuth,
  ResourceNotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from '@gravitaz/common';

import { validateRequest } from '@gravitaz/common';
import { body } from 'express-validator';
import { Order, OrderStatus } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';
import { Types as MongooseTypes } from 'mongoose';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('orderId')
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage('orderId must be a valid database id'),
    body('token').not().isEmpty().withMessage('payment token not supplied'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundError('Order not found');
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order cancelled');
    }

    const response = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'gbp',
      source: token,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
