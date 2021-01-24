import { Ticket } from "./tickets";

export enum OrderStatus {
    Created = "created",
    Cancelled = "cancelled",
    AwaitingPayment = "awaiting:payment",
    Complete = "complete"
}

export interface Order {
    id: number;
    ticket: Ticket;
    status: OrderStatus;
    expiresAt: Date;
    userId: string;
}