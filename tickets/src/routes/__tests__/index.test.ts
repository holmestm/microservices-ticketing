import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Types as MongooseTypes } from 'mongoose';

it('returns a 200 with an empty array if called and no tickets exist', async () => {
  await request(app).get('/api/tickets').send().expect(200);
});

it('returns a set of tickets when tickets exist', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  let sampleTickets = [
    { title: 'Arsenal Leeds', price: 10.5 },
    { title: 'Chelsea Spurs', price: 12 },
  ];

  let ticket, response;

  sampleTickets.map(async (ticket) => {
    response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send(ticket)
      .expect(201);
    const receivedTicket = response.body;
    expect(receivedTicket.title).toEqual(ticket.title);
    expect(receivedTicket.price).toEqual(ticket.price);
  });

  response = await request(app).get('/api/tickets').expect(200);
  const foundTickets = response.body;
  expect(foundTickets.length).toEqual(sampleTickets.length);
});

it('doesnt include cancelled tickets when returning set of tickets', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await Ticket.build({
    title: 'Arsenal Leeds',
    price: 10.5,
    userId: '123',
  }).save();

  const ticket = await Ticket.build({
    title: 'Chelsea Spurs',
    price: 10.5,
    userId: '123',
  })
    .set({ orderId: '123' })
    .save();

  let response = await request(app).get('/api/tickets?all=N').expect(200);
  let foundTickets = response.body;
  expect(foundTickets.length).toEqual(1);

  response = await request(app).get('/api/tickets?all=Y').expect(200);
  foundTickets = response.body;
  expect(foundTickets.length).toEqual(2);

  // default is all=Y
  response = await request(app).get('/api/tickets').expect(200);
  foundTickets = response.body;
  expect(foundTickets.length).toEqual(2);
});
