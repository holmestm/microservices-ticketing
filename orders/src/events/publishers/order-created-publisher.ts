import { Publisher, Subjects, OrderCreatedEvent } from '@gravitaz/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
