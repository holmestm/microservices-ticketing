import express, { Request, Response } from 'express';
import { cancelOrder } from '../services/cancel-order';
import { validateRequest, requireAuth } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param, body } from 'express-validator';

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
    const order = await cancelOrder(req.params.id, req.currentUser?.id);
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
