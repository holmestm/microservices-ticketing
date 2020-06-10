import { Publisher, Subjects, OrderCancelledEvent } from '@gravitaz/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
