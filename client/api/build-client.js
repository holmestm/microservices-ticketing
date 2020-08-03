import axios from 'axios';
import https from 'https';

// when running server side we need to call services via the internal ingress controller since that
// holds the routing logic for our apis. The baseURL here is k8s implementation specific and has been
// designed to work with Docker Desktop on MacOs.

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL:
        process.env.INTERNAL_LB ||
        `https://ingress-nginx-controller.ingress-nginx.svc.cluster.local`,
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

export default buildClient;
