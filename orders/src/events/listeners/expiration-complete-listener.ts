import { ExpirationCompleteEvent, Listener, Subjects } from '@gravitaz/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from '../queue-group-name';
import { cancelOrder } from '../../services/cancel-order';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: ExpirationCompleteEvent['data'],
    msg: Message
  ): Promise<void> {
    const { orderId } = data;
    await cancelOrder(orderId);
    msg.ack();
  }
}
