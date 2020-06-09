import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@gravitaz/common';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  let orders = await Order.find().populate('ticket');
  console.debug('GET all orders');

  if (!orders) {
    orders = [];
  }

  res.send(orders);
});

export { router as showAllOrdersRouter };
