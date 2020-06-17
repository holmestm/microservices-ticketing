// if we see an order cancelled event we need to unlock the ticket to permit changes to it's attributes
import { Listener, OrderCancelledEvent, Subjects } from '@gravitaz/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from '../queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  async onMessage(
    data: OrderCancelledEvent['data'],
    msg: Message
  ): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id);
    console.log('Resolved ticket');

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined });

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
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = QUEUE_GROUP_NAME;
  publisher: TicketUpdatedPublisher | undefined = undefined;
  getPublisher = (): TicketUpdatedPublisher => {
    if (!this.publisher)
      this.publisher = new TicketUpdatedPublisher(this.client);
    return this.publisher;
  };
}
