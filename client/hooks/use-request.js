import axios from 'axios';
import { useState } from 'react';

// returns a function that will call an external endpoint, returning the response
// from that endpoint or if it fails setting the errors state to display back to the user
export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);
      if (onSuccess(response.data));
      return response.data;
    } catch (err) {
      let errors = err.response.data.errors || err.response.data;
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
