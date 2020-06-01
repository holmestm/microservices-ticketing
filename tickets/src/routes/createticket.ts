import express, { Request, Response } from 'express';
import { requireAuth } from '@gravitaz/common';

import { validateRequest } from '@gravitaz/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
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
    const { title, price } = req.body;

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
