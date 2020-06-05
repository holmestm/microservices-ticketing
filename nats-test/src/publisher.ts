import nats from 'node-nats-streaming';
console.clear();

const stan = nats.connect('ticketing', 'publish_1', {
  url: 'http://ticketing.dev:4222',
});

stan.on('connect', () => {
  console.log('Publisher connected to NATS');

  const data = JSON.stringify({
    id: 23,
    title: 'concert',
    price: 20,
  });

  stan.publish('ticket:created', data, () => {
    console.log('Event published');
  });
});
