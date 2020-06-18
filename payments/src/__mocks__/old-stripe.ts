import { Types as MongooseTypes } from 'mongoose';

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: 'StripeCharge_123' }),
  },
};
