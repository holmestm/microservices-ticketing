import { Listener, Subjects, TicketUpdatedEvent } from '@gravitaz/common';
import { Message } from 'node-nats-streaming';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName: string = 'payments-service';
  onMessage(data: TicketUpdatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);

    msg.ack();
  }
}
