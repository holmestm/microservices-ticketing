import { Order } from '../models/order';
import {
  ResourceNotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@gravitaz/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

let publisher: OrderCancelledPublisher;

const getPublisher = (): OrderCancelledPublisher => {
  if (!publisher) publisher = new OrderCancelledPublisher(natsWrapper.client);
  return publisher;
};

export const cancelOrder = async function (
  orderId: string,
  currentUserId?: string
) {
  const order = await Order.findById(orderId).populate('ticket');
  if (!order) {
    throw new ResourceNotFoundError('Order not found');
  }
  if (currentUserId && order.userId !== currentUserId) {
    throw new NotAuthorizedError();
  }
  if (
    order.status === OrderStatus.Created ||
    order.status === OrderStatus.AwaitingPayment
  ) {
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    await getPublisher().publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id },
    });
  }
  return order;
};
