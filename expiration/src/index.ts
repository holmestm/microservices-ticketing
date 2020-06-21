import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  const envvars = [
    'NATS_CLIENT_ID',
    'NATS_URL',
    'NATS_CLUSTER_ID',
    'REDIS_HOST',
  ];
  envvars.map((v) => {
    if (!process.env[v]) {
      throw new Error(`${v} is not defined`);
    }
    console.log(`${v} = ${process.env[v]}`);
  });
  const { NATS_CLIENT_ID, NATS_URL, NATS_CLUSTER_ID } = process.env;
  try {
    await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
  console.log('Expiration service starting up...');
};

start();
