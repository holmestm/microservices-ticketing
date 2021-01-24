import axios, { AxiosRequestConfig, Method } from 'axios';
import { useState } from 'react';

type RequestParams = {
  url: string,
  method: Method,
  data: any,
  onSuccess: CallableFunction
}

// returns a function that will call an external endpoint, returning the response
// from that endpoint or if it fails setting the errors state to display back to the user
// in jsx format. Our endpoints return errors as a array of messages.
const useRequest = ({ url, method, data, onSuccess }: RequestParams) => {
  const [errors, setErrors] = useState<JSX.Element|null>(null);

  const doRequest = async (args = {}) => {
    try {
      console.log('url', url);
      console.log('data', data);
      console.log('props', args);
      setErrors(null);
      const response = await axios({ url, method, data, ...args });
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
            {errors.map((err: any) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
export default useRequest;