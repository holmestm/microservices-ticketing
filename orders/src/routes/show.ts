import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
  ResourceNotFoundError,
  validateRequest,
  requireAuth,
} from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param } from 'express-validator';

const router = express.Router();

router.get(
  '/api/orders/:id',
  requireAuth,
  param('id')
    .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
    .withMessage('Parameter must be a valid MongoDB Identifier'),
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');
    console.debug('GET Order by id');
    if (!order) {
      throw new ResourceNotFoundError('Order not found');
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
