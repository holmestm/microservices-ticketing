import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Types as MongooseTypes } from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects } from '@gravitaz/common';

it('returns a 400 if id format is invalid', async () => {
  const response = await request(app)
    .delete('/api/orders/123')
    .set('Cookie', global.signin())
    .expect(400);
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
  const { storedOrders } = await global.createSampleOrdersForUser(userId);
  await request(app).delete(`/api/orders/${storedOrders[0].id}`).expect(401);
});

it('returns an 401 if the user doesnt own the order', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const { storedOrders } = await global.createSampleOrdersForUser(userId);
  const response = await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin());

  expect(response.status).toEqual(401);
});

it('returns a 200 with valid inputs', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const { storedOrders } = await global.createSampleOrdersForUser(userId);
  await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(204);
});

it("doesn't actually deletes an order from the database but updates it's status", async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const { storedOrders } = await global.createSampleOrdersForUser(userId);
  await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(204);

  const order = await Order.findById(storedOrders[0].id);
  expect(order).not.toBeNull();
  expect(order?.status).toBe(OrderStatus.Cancelled);
});

it('publishes an event', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const { storedOrders } = await global.createSampleOrdersForUser(userId);
  await request(app)
    .delete(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCancelled,
    expect.any(String),
    expect.any(Function)
  );
});
