// if we see an order created event we need to lock the ticket to prevent changes to its attributes
import { Listener, OrderCreatedEvent, Subjects } from '@gravitaz/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from '../queue-group-name';
import { Order } from '../../models/orders';
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ): Promise<void> {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    if (!order) {
      throw new Error('Unable to create order internal error');
    }

    await order.save();
    msg.ack();
  }
}
