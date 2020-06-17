import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedEvent, OrderStatus, Subjects } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/orders';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  // create a fake data event

  const data: OrderCreatedEvent['data'] = {
    version: 0,
    id: new MongooseTypes.ObjectId().toHexString(), // orderId
    status: OrderStatus.Created,
    expiresAt: '',
    userId: new MongooseTypes.ObjectId().toHexString(),
    ticket: { id: new MongooseTypes.ObjectId().toHexString(), price: 100 },
  };
  // create a fake message

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates an order', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  // write ssertions to make sure a ticket was created!
  let newOrder = await Order.findById(data.id);

  expect(newOrder).toBeDefined;
  expect(newOrder?.id).toEqual(data.id);
  expect(newOrder?.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
