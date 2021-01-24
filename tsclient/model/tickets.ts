export interface Ticket {
    id: number;
    title: string;
    price: number;
    userId: string;
    orderId?: string;
}