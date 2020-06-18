import { Publisher, Subjects, PaymentCreatedEvent } from '@gravitaz/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
