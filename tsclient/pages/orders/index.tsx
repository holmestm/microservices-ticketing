import { AuthComponentProps } from "../../model/authComponentProps";
import { Order } from "../../model/orders";

const OrderIndex = ({ orders }: {orders: Order[]}) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async ({ client } : AuthComponentProps) => {
  const { data } = await client.get('/api/orders');
  return { orders: data };
};

export default OrderIndex;
