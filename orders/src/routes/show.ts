import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
  ResourceNotFoundError,
  validateRequest,
  requireAuth,
  NotAuthorizedError,
} from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param } from 'express-validator';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    console.log('Showing', order);
    if (!order) {
      throw new ResourceNotFoundError('Invalid Order');
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    res.send(order);
  }
);

export { router as showOrderRouter };
