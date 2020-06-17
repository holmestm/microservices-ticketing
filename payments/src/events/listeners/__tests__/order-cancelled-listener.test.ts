import { natsWrapper } from '../../../nats-wrapper';
import { OrderStatus, Subjects, OrderCancelledEvent } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/orders';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  // create a fake data event

  const orderId = new MongooseTypes.ObjectId().toHexString();

  // create a fake order
  const order = Order.build({
    id: orderId,
    version: 0,
    status: OrderStatus.Created,
    userId: new MongooseTypes.ObjectId().toHexString(),
    price: 100,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    version: 1,
    id: orderId,
    ticket: { id: new MongooseTypes.ObjectId().toHexString() },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('cancels an order', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  // write ssertions to make sure a ticket was created!
  let cancelledOrder = await Order.findById(data.id);

  expect(cancelledOrder).toBeDefined;
  expect(cancelledOrder?.id).toEqual(data.id);
  expect(cancelledOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
