import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Types as MongooseTypes } from 'mongoose';

const user2 = { id: '67890', email: 'test2@test.com' };
const newTicket = { title: 'Arsenal Leeds', price: 20.5 };

const createSampleTickets = async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  let sampleTickets = [
    { id: null, title: 'Arsenal Leeds', price: 10.5 },
    { id: null, title: 'Chelsea Spurs', price: 12 },
  ];

  const storedTickets = await Promise.all(
    sampleTickets.map(async (ticket) => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send(ticket)
        .expect(201);
      const receivedTicket = response.body;
      expect(receivedTicket.title).toEqual(ticket.title);
      expect(receivedTicket.price).toEqual(ticket.price);
      ticket.id = receivedTicket.id;
      return ticket;
    })
  );

  return storedTickets;
};

it('returns a 400 if id format is invalid', async () => {
  await request(app)
    .put('/api/tickets/123')
    .set('Cookie', global.signin())
    .send(newTicket)
    .expect(400);
});

it('returns a 404 if ticket is not found with a valid id', async () => {
  const id = new MongooseTypes.ObjectId().toHexString();
  let response = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send(newTicket);
  expect(response.status).toEqual(404);
});

it('returns an 401 if the user is not authenticated', async () => {
  const storedTickets = await createSampleTickets();
  await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .send(newTicket)
    .expect(401);
});

it('returns an 401 if the user doesnt own the ticket', async () => {
  const storedTickets = await createSampleTickets();
  const response = await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .set('Cookie', global.signin(user2))
    .send(newTicket);

  expect(response.status).toEqual(401);
});

it('returns an 400 if the provided title or price are invalid', async () => {});

it('returns 400 if an invalid price is provided', async () => {
  const storedTickets = await createSampleTickets();
  await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: 'badprice' })
    .expect(400);
});

it('returns 400 if a zero price is provided', async () => {
  const storedTickets = await createSampleTickets();
  await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: 0 })
    .expect(400);
});

it('returns an error if an negative price is provided', async () => {
  const storedTickets = await createSampleTickets();
  await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .set('Cookie', global.signin())
    .send({ title: 'Arsenal Leeds', price: '-20' })
    .expect(400);
});

it('returns a 200 with valid inputs', async () => {
  const storedTickets = await createSampleTickets();
  await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .set('Cookie', global.signin())
    .send(newTicket)
    .expect(200);
});

it('updates a ticket with valid inputs', async () => {
  const storedTickets = await createSampleTickets();
  await request(app)
    .put(`/api/tickets/${storedTickets[0].id}`)
    .set('Cookie', global.signin())
    .send(newTicket)
    .expect(200);

  const ticket = await Ticket.findById(storedTickets[0].id);
  expect(ticket?.price).toEqual(newTicket.price);
});
