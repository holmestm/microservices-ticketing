import { Publisher, Subjects, OrderDeletedEvent } from '@gravitaz/common';

export class OrderDeletedPublisher extends Publisher<OrderDeletedEvent> {
  readonly subject = Subjects.OrderDeleted;
}
