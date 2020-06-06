import { Publisher, Subjects, TicketCreatedEvent } from '@gravitaz/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
