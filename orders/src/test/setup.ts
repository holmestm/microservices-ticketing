import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Order, OrderDoc, OrderAttrs } from '../models/order';
import { Ticket, TicketDoc, TicketAttrs } from '../models/ticket';
import { Types as MongooseTypes } from 'mongoose';
import { OrderStatus } from '@gravitaz/common';

declare global {
  namespace NodeJS {
    interface Global {
      signin(user?: Object): string[];
      createSampleOrdersForUser(userId?: string): Promise<OrderDoc[]>;
      createSampleTickets(): Promise<TicketDoc[]>;
    }
  }
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  console.debug = () => {};
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (optionalUser: Object) => {
  const user = { id: '12345', email: 'test@test.com', ...optionalUser };
  const userJwt = jwt.sign(user, process.env.JWT_KEY!);
  const session = {
    jwt: userJwt,
  };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  const cookie = `express:sess=${base64}`;
  return [cookie];
};

global.createSampleTickets = async (): Promise<TicketDoc[]> => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  let sampleTickets: TicketAttrs[] = [
    { title: 'ticket1', price: 10.5 },
    { title: 'ticket2', price: 12 },
  ];

  const storedTickets = await Promise.all(
    sampleTickets.map(async (ticketAttr) => {
      const newTicket: TicketDoc = Ticket.build(ticketAttr);
      newTicket.save();
      return newTicket;
    })
  );
  return storedTickets;
};

// creates two orders, one for each of the tickets created above, second is pre-expired
global.createSampleOrdersForUser = async (
  userId: string
): Promise<OrderDoc[]> => {
  let orders = await Order.find({});
  expect(orders.length).toEqual(0);

  const addExpiry = (date: Date, mins: number): Date => {
    date.setDate(date.getDate() + mins);
    return date;
  };

  const tickets = await global.createSampleTickets();

  let sampleOrders: OrderAttrs[] = [
    {
      ticket: tickets[0],
      status: OrderStatus.Created,
      expiresAt: addExpiry(new Date(), 15),
      userId,
    },
    {
      ticket: tickets[1],
      status: OrderStatus.Created,
      expiresAt: addExpiry(new Date(), 15),
      userId,
    },
  ];

  const storedOrders: OrderDoc[] = await Promise.all(
    sampleOrders.map(async (orderAttrs) => {
      let newOrder = Order.build(orderAttrs);
      newOrder.save();
      return newOrder;
    })
  );

  return storedOrders;
};
