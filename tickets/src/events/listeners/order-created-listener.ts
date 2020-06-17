// if we see an order created event we need to lock the ticket to prvent changes to it's attributes
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  TicketUpdatedEvent,
} from '@gravitaz/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from '../queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ): Promise<void> {
    console.log(`Order created event received by Tickets Service`);
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: data.id });

    await ticket.save();

    const { id, version, title, price, userId, orderId } = ticket;
    await this.getPublisher().publish({
      id,
      version,
      title,
      price,
      userId,
      orderId,
    });

    msg.ack();
  }
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;
  publisher: TicketUpdatedPublisher | undefined = undefined;
  getPublisher = (): TicketUpdatedPublisher => {
    if (!this.publisher)
      this.publisher = new TicketUpdatedPublisher(this.client);
    return this.publisher;
  };
}
