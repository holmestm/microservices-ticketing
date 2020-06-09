import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { ResourceNotFoundError, validateRequest } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { param } from 'express-validator';

const router = express.Router();

router.get(
  '/api/tickets/:id',
  param('id')
    .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
    .withMessage('Parameter must be a valid MongoDB Identifier'),
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    console.debug('GET Ticket by id');
    if (!ticket) {
      throw new ResourceNotFoundError('ticket not found');
    }

    res.send(ticket);
  }
);

export { router as showTicketRouter };