import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Types as MongooseTypes } from 'mongoose';

it('returns a 400 if id format is invalid', async () => {
  await request(app).get('/api/tickets/123').send().expect(400);
});

it('returns a 404 if ticket is not found with a valid id', async () => {
  const id = new MongooseTypes.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).expect(404);
});

it('returns the ticket if it is found', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'Arsenal Leeds';
  const price = 10.5;

  let response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);
  const ticket = response.body;
  expect(ticket.title).toEqual(title);
  expect(ticket.price).toEqual(price);

  response = await request(app).get(`/api/tickets/${ticket.id}`).expect(200);
  const foundTicket = response.body;

  expect(ticket.id).toEqual(foundTicket.id);
  expect(ticket.title).toEqual(foundTicket.title);
  expect(ticket.price).toEqual(foundTicket.price);
});
