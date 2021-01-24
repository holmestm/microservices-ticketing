import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';
import { Order } from '../../model/orders';
import { User } from '../../model/user';
import { AuthComponentProps } from '../../model/authComponentProps';

const OrderShow = ({ order, currentUser }: {order: Order, currentUser: User}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout>();
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    data: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft: number = (new Date(order.expiresAt)).valueOf() - (new Date()).valueOf();
      console.log(`Time left ${msLeft}`);
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    setTimerId(timerId);

    return () => {
      clearInterval(timerId);
    };
  }, [order]); // tells react only to call this once - set of dependent objects

  if (timeLeft < 3) {
    if (timerId) clearInterval(timerId);
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <h1>Purchase</h1>
      <div>Time left to pay {timeLeft} seconds</div>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_xhXDZSAn0DRetXP0qAbySCsE"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async ({ context, client, currentUser } : AuthComponentProps) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  console.log('Order ');
  console.dir(data);
  return { order: data };
};
export default OrderShow;
