import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketUpdatedListener } from './events/ticket-updated-listener';

console.clear();
const stan = nats.connect(
  'ticketing',
  `listen_${randomBytes(4).toString('hex')}`,
  {
    url: 'http://ticketing.dev:4222',
  }
);
stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NAS connection closed');
    process.exit();
  });

  const listener = new TicketUpdatedListener(stan);
  listener.listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
