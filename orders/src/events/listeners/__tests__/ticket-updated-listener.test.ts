import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create a fake ticket with implicit version 0
  const ticket = Ticket.build({
    id: '',
    title: 'TestTitle',
    price: 10,
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: 1,
    id: ticket.id,
    title: 'TicketTitle2',
    price: 15,
    userId: new MongooseTypes.ObjectId().toHexString(),
  };
  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('updates a ticket', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was updated!
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined;
  expect(ticket?.title).toEqual('TicketTitle2');
  expect(ticket?.price).toEqual(15);
  expect(ticket?.version).toEqual(1);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);

  // write ssertions to make sure an ack ws called!
  expect(msg.ack).toHaveBeenCalled();
});

it('Doesnt update the ticket if version is wrong', async () => {
  const { listener, data, msg, ticket: originalTicket } = await setup();

  data.version = 2;
  // call the onMessage function with data object + message object
  await expect(listener.onMessage(data, msg)).rejects.toThrow();

  // write assertions to make sure a ticket was updated!
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined;
  expect(ticket?.title).not.toEqual('TicketTitle2');
  expect(ticket?.price).not.toEqual(15);
  expect(ticket?.version).not.toEqual(1);
});

it('Doesnt ack the ticket if version is wrong', async () => {
  const { listener, data, msg, ticket: originalTicket } = await setup();

  data.version = 2;
  // call the onMessage function with data object + message object
  await expect(listener.onMessage(data, msg)).rejects.toThrow();

  // write assertions to make sure a ticket was updated!
  expect(msg.ack).not.toHaveBeenCalled();
});
