import { Publisher, Subjects, OrderCancelledEvent } from '@gravitaz/common';

export class OrderDeletedPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
