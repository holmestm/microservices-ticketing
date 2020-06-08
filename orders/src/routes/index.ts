import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { NotFoundError, validateRequest, requireAuth } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param } from 'express-validator';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  let orders = await Order.find();
  console.debug('GET all orders');

  if (!orders) {
    orders = [];
  }

  res.send(orders);
});

export { router as showAllOrdersRouter };
