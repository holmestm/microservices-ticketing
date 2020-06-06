export enum Subjects {
  TicketCreated = 'ticket:created',
  OrderUpdated = 'order:updated',
}

export interface TEvent {
  subject: Subjects;
  data: any;
}
