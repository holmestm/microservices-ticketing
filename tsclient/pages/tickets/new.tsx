import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import { Ticket } from '../../model/tickets';

const newTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2)); // round up the price
  };
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: (ticket: Ticket) => {
      console.log(ticket);
      Router.push('/');
    },
  });
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    doRequest();
  };
  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur} // triggered on a click into or out of an input box
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default newTicket;
