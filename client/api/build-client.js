import axios from 'axios';

export default ({ req, svc = 'auth' }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      //      baseURL: `http://${svc}-srv:3000`,
      baseURL: `ingress-nginx-controller.kube-system.svc.cluster.local`,
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseUrl: '/',
    });
  }
};
