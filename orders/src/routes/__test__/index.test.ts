import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Types as MongooseTypes } from 'mongoose';

it('returns a 200 with an empty array if called and no orders exist', async () => {
  await request(app).get('/api/orders').set('Cookie', global.signin());
  expect(200);
});

it('returns a 200 with array of orders if called and orders exist', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const { storedOrders } = await global.createSampleOrdersForUser(userId);
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin({ id: userId }));
  expect(response.body.length).toEqual(storedOrders.length);
});
