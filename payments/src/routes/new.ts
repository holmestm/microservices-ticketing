import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from '@gravitaz/common';

import { validateRequest } from '@gravitaz/common';
import { body } from 'express-validator';
import { Order, OrderStatus } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';
import { Types as MongooseTypes } from 'mongoose';
import { stripe } from '../stripe';
import { Payment } from '../models/payments';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

const router = express.Router();
let publisher: PaymentCreatedPublisher;
let getPublisher = (): PaymentCreatedPublisher => {
  if (!publisher) publisher = new PaymentCreatedPublisher(natsWrapper.client);
  return publisher;
};

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
      throw new NotFoundError('Order not found');
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order cancelled');
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'gbp',
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    await getPublisher().publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send(payment.toJSON());
  }
);

export { router as createChargeRouter };
