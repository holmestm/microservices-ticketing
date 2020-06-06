import { Publisher, Subjects, TicketUpdatedEvent } from '@gravitaz/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
