import axios from 'axios';
import { useState } from 'react';

// returns a function that will call an external endpoint, returning the response
// from that endpoint or if it fails setting the errors state to display back to the user
// in jsx format. Our endpoints return errors as a array of messages.
export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (args = {}) => {
    try {
      console.log('url', url);
      console.log('body', body);
      console.log('props', args);
      setErrors(null);
      const response = await axios[method](url, { ...body, ...args });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      console.error(err);
      let errors =
        err.response && err.response.data
          ? err.response.data.errors || err.response.data
          : [err.message, 'No errors returned'];
      setErrors(
        <div className="alert alert-danger">
          <h4>Errors...</h4>
          <ul className="my-0">
            {errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
