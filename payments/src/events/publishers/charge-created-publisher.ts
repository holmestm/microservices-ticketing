import { Publisher, Subjects, TicketCreatedEvent } from '@gravitaz/common';

export class ChargeCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
