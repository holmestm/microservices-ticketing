import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects, OrderStatus } from '@gravitaz/common';

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/orders').send({});
  expect(response.status).not.toEqual(404);
});

it('can not be accessed if the user is not signed in', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

it('can be accessed if the user is signed in', async () => {
  let response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns a 201 with valid inputs', async () => {
  const sampleTickets = await global.createSampleTickets();
  let response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: sampleTickets[0].id })
    .expect(201);
});

it('creates a database entry with valid inputs', async () => {
  let orders = await Order.find({});
  expect(orders.length).toEqual(0);
  const sampleTickets = await global.createSampleTickets();

  let response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: sampleTickets[0].id })
    .expect(201);

  const returnedOrder = response.body;
  console.log('Returned Order', returnedOrder);

  expect(returnedOrder.ticket.id).toEqual(sampleTickets[0].id);
  expect(returnedOrder.status).toEqual(OrderStatus.Created);
});

it('publishes an event', async () => {
  const sampleTickets = await global.createSampleTickets();

  let response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: sampleTickets[0].id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCreated,
    expect.any(String),
    expect.any(Function)
  );
});
