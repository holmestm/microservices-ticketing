import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { app } from './app';

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
    console.log('Connecting to NATS')
    await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!);
    console.log('Connected to NATS')
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    console.log('Connecting to MongoDB');
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
    console.log('Ticket Service Listening on port 3000');
  });
};

start();
