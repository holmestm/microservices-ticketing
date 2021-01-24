import Link from 'next/link';
import { AuthComponentProps } from '../model/authComponentProps';
import { Ticket } from '../model/tickets';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket: Ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};
LandingPage.getInitialProps = async ({ client } : AuthComponentProps) => {
  const { data } = await client.get('/api/tickets?all=N');
  return { tickets: data };
};

export default LandingPage;
