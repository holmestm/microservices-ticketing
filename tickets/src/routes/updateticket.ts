import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import {
  NotFoundError,
  validateRequest,
  requireAuth,
  currentUser,
  NotAuthorizedError,
} from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param, body } from 'express-validator';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    param('id')
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage('Parameter must be a valid MongoDB Identifier'),
    body('title')
      .isString()
      .not()
      .isEmpty()
      .withMessage('Title must be a non empty string'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError(req);
    }
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
