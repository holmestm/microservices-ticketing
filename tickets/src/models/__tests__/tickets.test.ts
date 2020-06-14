import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // create a test ticket

  const initialTicket = Ticket.build({
    title: 'test title',
    price: 10,
    userId: '123',
  });

  // save the ticket to the database
  await initialTicket.save();

  // fetch the ticket twice

  let ticket1 = await Ticket.findById(initialTicket.id);
  let ticket2 = await Ticket.findById(initialTicket.id);

  // make two separate changes to the tickets we fetchedf

  ticket1!.price = 15;
  ticket2!.price = 10;

  // try and save them both as is - first should work but second should fail

  await ticket1!.save();
  await expect(ticket2!.save()).rejects.toThrow();
});

it('increments the version number on every save', async () => {
  const ticket = Ticket.build({
    title: 'test title',
    price: 10,
    userId: '123',
  });
  await ticket.save();
  expect(ticket.version).toBe(0);
  await ticket.save();
  expect(ticket.version).toBe(1);
  await ticket.save();
  expect(ticket.version).toBe(2);
});
