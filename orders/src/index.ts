import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { app } from './app';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  const envvars = [
    'JWT_KEY',
    'MONGO_URI',
    'NATS_CLIENT_ID',
    'NATS_URL',
    'NATS_CLUSTER_ID',
  ];
  envvars.map((v) => {
    if (!process.env[v]) {
      throw new Error(`${v} is not defined`);
    }
    console.log(`${v} = ${process.env[v]}`);
  });
  const {
    JWT_KEY,
    MONGO_URI,
    NATS_CLIENT_ID,
    NATS_URL,
    NATS_CLUSTER_ID,
  } = process.env;
  try {
    await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Order Service Listening on port 3000');
  });
};

start();
