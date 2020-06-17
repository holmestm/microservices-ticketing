import { ExpirationCompleteEvent, Publisher, Subjects } from '@gravitaz/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
