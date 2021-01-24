import useRequest from '../../hooks/use-request';
import Router from 'next/router';
import { AuthComponentProps } from '../../model/authComponentProps';
import { Order } from '../../model/orders';
import { Ticket } from '../../model/tickets';

const TicketShow = ({ ticket } : { ticket: Ticket}) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order: Order) => {
      console.log('Order placed', order);
      Router.push('/orders/[orderId]', `/orders/${order.id}`);
    },
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button
        onClick={() => {
          doRequest();
        }}
        className="btn btn-primary"
      >
        Purchase
      </button>
    </div>
  );
};

// Following is called by ../_app.js, which already has client and currentUser so
// following will merge into the total set of props passed into above function the
// details of the ticket to show.
TicketShow.getInitialProps = async ({ context, client } : AuthComponentProps) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};
export default TicketShow;
