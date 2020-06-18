import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects, OrderStatus } from '@gravitaz/common';
import { Types as MongooseTypes } from 'mongoose';
import Stripe from 'stripe';
import { Payment } from '../../models/payments';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2020-03-02',
  typescript: true,
});

it('returns a 201 with valid inputs and creates a valid stripe charge', async () => {
  const orderId = new MongooseTypes.ObjectId().toHexString();
  const user = {
    id: new MongooseTypes.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  const price = Math.floor(Math.random() * 100000);

  // create a fake order
  const order = Order.build({
    id: orderId,
    version: 0,
    status: OrderStatus.Created,
    userId: user.id,
    price: price,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(user))
    .send({ orderId: orderId, token: 'tok_visa' })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripeCharge).toBeDefined();

  const payment = await Payment.findOne({
    orderId,
    stripeId: stripeCharge?.id,
  });
  expect(payment).not.toBeNull();
});

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/payments').send({});

  expect(response.status).not.toEqual(404);
});

it('can not be accessed if the user is not signed in', async () => {
  await request(app).post('/api/payments').send({}).expect(401);
});

it('can be accessed if the user is signed in', async () => {
  let response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid order is provided', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ orderId: '', token: 'abc' })
    .expect(400);
});

it('returns an error if an invalid token is provided', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ orderId: new MongooseTypes.ObjectId().toHexString(), token: '' })
    .expect(400);
});

it('Returns an error if the order is cancelled', async () => {
  const orderId = new MongooseTypes.ObjectId().toHexString();
  const user = {
    id: new MongooseTypes.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // create a fake order
  const order = Order.build({
    id: orderId,
    version: 0,
    status: OrderStatus.Cancelled,
    userId: user.id,
    price: 100,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(user))
    .send({ orderId: orderId, token: 'ABC' })
    .expect(400);
});

it('Returns an error if the order is owned by a different user', async () => {
  const orderId = new MongooseTypes.ObjectId().toHexString();

  // create a fake order
  const order = Order.build({
    id: orderId,
    version: 0,
    status: OrderStatus.Created,
    userId: new MongooseTypes.ObjectId().toHexString(),
    price: 100,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ orderId: orderId, token: 'ABC' })
    .expect(401);
});
