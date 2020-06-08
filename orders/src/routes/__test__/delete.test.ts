import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Types as MongooseTypes } from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects } from '@gravitaz/common';

it('returns a 400 if id format is invalid', async () => {
  const response = await request(app)
    .delete('/api/orders/123')
    .set('Cookie', global.signin())
    .expect(400);
  console.log(response.body);
});

it('returns a 404 if order is not found with a valid id', async () => {
  const id = new MongooseTypes.ObjectId().toHexString();
  let response = await request(app)
    .delete(`/api/orders/${id}`)
    .set('Cookie', global.signin());
  expect(response.status).toEqual(404);
});

it('returns an 401 if the user is not authenticated', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const storedOrders = await global.createSampleOrdersForUser(userId);
  await request(app).delete(`/api/orders/${storedOrders[0].id}`).expect(401);
});

it('returns an 401 if the user doesnt own the order', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const storedOrders = await global.createSampleOrdersForUser(userId);
  const response = await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin());

  expect(response.status).toEqual(401);
});

it('returns a 200 with valid inputs', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const storedOrders = await global.createSampleOrdersForUser(userId);
  await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(200);
});

it('actually deletes an order from the database', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const storedOrders = await global.createSampleOrdersForUser(userId);
  await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(200);

  const order = await Order.findById(storedOrders[0].id);
  expect(order).toBeNull();
});

it('publishes an event', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const storedOrders = await global.createSampleOrdersForUser(userId);
  await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.OrderDeleted,
    expect.any(String),
    expect.any(Function)
  );
});
