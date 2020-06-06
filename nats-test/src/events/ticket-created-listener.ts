import { Listener, Subjects, TicketCreatedEvent } from '@gravitaz/common';
import { Message } from 'node-nats-streaming';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName: string = 'payments-service';
  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);

    msg.ack();
  }
}
