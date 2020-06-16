import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent, OrderStatus, Subjects } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  // create a fake data event

  const ticket = Ticket.build({
    title: 'TestTitle',
    price: 10,
    userId: new MongooseTypes.ObjectId().toHexString(),
  });
  ticket.set({ orderId: new MongooseTypes.ObjectId().toHexString() });
  await ticket.save();

  const { id } = ticket;

  const data: OrderCancelledEvent['data'] = {
    version: 0,
    id: new MongooseTypes.ObjectId().toHexString(),
    ticket: { id },
  };
  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

// happy path
it('unlocks a ticket if we see an order cancellation event', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  // write ssertions to make sure a ticket was created!
  let updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket).toBeDefined;
  expect(updatedTicket?.orderId).not.toBeDefined();
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes the ticket update event', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedMessage = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedMessage.orderId).not.toBeDefined();
  expect(ticketUpdatedMessage.version).toBeGreaterThan(0);
});
