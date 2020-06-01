import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can not be accessed if the user is not signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('can be accessed if the user is signed in', async () => {
  let response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: '', price: '£10' })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: '€10' })
    .expect(400);
});

it('returns an error if an zero price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: 0 })
    .expect(400);
});

it('returns an error if an negative price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: '-20' })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  let response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: 10.5 })
    .expect(201);
});

it('creates a database entry with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'Arsenal Leeds';
  const price = 10.5;

  let response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const returnedTicket = response.body;
  expect(returnedTicket.title).toEqual(title);
  expect(returnedTicket.price).toEqual(price);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);

  const foundTicket = tickets[0];
  expect(foundTicket.title).toEqual(title);
  expect(foundTicket.price).toEqual(price);
});
