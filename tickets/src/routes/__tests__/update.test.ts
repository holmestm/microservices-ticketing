import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Types as MongooseTypes } from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects, TicketCreatedEvent } from '@gravitaz/common';

const user1 = { id: '12345', email: 'test@test.com' };
const user2 = { id: '67890', email: 'test2@test.com' };
const newTicket = { title: 'Updated Ticket', price: 20.5 };

// create a couple of stored tickets, second is reserved
const createTicket = async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  let ticket = await Ticket.build({
    title: 'Available Ticket',
    price: 10.5,
    userId: user1.id,
  }).save();

  return ticket;
};

it('returns a 400 if id format is invalid', async () => {
  await request(app)
    .put('/api/tickets/123')
    .set('Cookie', global.signin(user1))
    .send(newTicket)
    .expect(400);
});

it('returns a 404 if ticket is not found with a valid id', async () => {
  const id = new MongooseTypes.ObjectId().toHexString();
  let response = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin(user1))
    .send(newTicket);
  expect(response.status).toEqual(404);
});

it('returns an 401 if the user is not authenticated', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .send(newTicket)
    .expect(401);
});

it('returns an 401 if the user doesnt own the ticket', async () => {
  const ticket = await createTicket();
  const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user2))
    .send(newTicket);

  expect(response.status).toEqual(401);
});

it('returns an 400 if the provided title or price are invalid', async () => {});

it('returns 400 if an invalid price is provided', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user1))
    .send({ title: 'Arsenal Leeds', price: 'badprice' })
    .expect(400);
});

it('returns 400 if a zero price is provided', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user1))
    .send({ title: 'Arsenal Leeds', price: 0 })
    .expect(400);
});

it('returns an error if an negative price is provided', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user1))
    .send({ title: 'Arsenal Leeds', price: '-20' })
    .expect(400);
});

it('returns a 200 with valid inputs', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user1))
    .send(newTicket)
    .expect(200);
});

it('updates a ticket with valid inputs', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user1))
    .send(newTicket)
    .expect(200);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.price).toEqual(newTicket.price);
});

it('publishes an event', async () => {
  const ticket = await createTicket();
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin(user1))
    .send(newTicket)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.TicketUpdated,
    expect.any(String),
    expect.any(Function)
  );
});

it('rejects an update of a ticket that is reserved', async () => {
  const reservedTicket = await createTicket();

  await reservedTicket
    .set({ orderId: new MongooseTypes.ObjectId().toHexString() })
    .save();

  await request(app)
    .put(`/api/tickets/${reservedTicket.id}`)
    .set('Cookie', global.signin(user1))
    .send(newTicket)
    .expect(400);
});
