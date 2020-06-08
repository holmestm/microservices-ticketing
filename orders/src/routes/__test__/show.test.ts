import request from 'supertest';
import { app } from '../../app';
import { Types as MongooseTypes } from 'mongoose';

it('returns a 400 if id format is invalid', async () => {
  await request(app)
    .get('/api/orders/123')
    .set('Cookie', global.signin())
    .expect(400);
});

it('returns a 404 if order is not found with a valid id', async () => {
  const id = new MongooseTypes.ObjectId().toHexString();
  await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .expect(404);
});

it('returns the order if it is found', async () => {
  const userId = new MongooseTypes.ObjectId().toHexString();
  const storedOrders = await global.createSampleOrdersForUser(userId);
  const returnedOrder = await request(app)
    .get(`/api/orders/${storedOrders[0].id}`)
    .set('Cookie', global.signin({ id: userId }))
    .expect(200);

  expect(returnedOrder.body).toHaveProperty('ticket');
});
