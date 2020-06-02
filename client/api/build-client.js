import axios from 'axios';
import https from 'https';

export default ({ req, svc = 'auth' }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: `https://ingress-nginx-controller.ingress-nginx.svc.cluster.local`,
      headers: req.headers,
      timeout: 500,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }), // ignore self-signed certificate
    });
  } else {
    return axios.create({
      baseUrl: '/',
    });
  }
};
