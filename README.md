# microservices-ticketing

Brief notes for me.

- Node backends
- React front end
- Deploy via Docker/Kubernetes

# K8s

- GCP - unable to access Ingress internally - check if Expose frees this up
- Microk8s - issue with ingress-nginx on old CPUs so using minikube, ran with local registry following guidelines on Ubuntu site
- Docker Desktop on MacOS after running installation as per https://kubernetes.github.io/ingress-nginx/deploy/ I then followed this else got error:

macbookface:k8s tim\$ kubectl apply -f ingress-srv.yaml
Error from server (InternalError): error when creating "ingress-srv.yaml": Internal error occurred: failed calling webhook "validate.nginx.ingress.kubernetes.io": Post https://ingress-nginx-controller-admission.ingress-nginx.svc:443/extensions/v1beta1/ingresses?timeout=30s: dial tcp 10.111.134.109:443: connect: connection refused

---

There is some issue with SSL cert it seems in the webhook.

Chaning failurePolicy: Fail to Ignore worked for me in the

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-0.32.0/deploy/static/provider/baremetal/deploy.yaml

for more info check:

https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/

From
https://stackoverflow.com/questions/61365202/nginx-ingress-service-ingress-nginx-controller-admission-not-found

# My Setup

- Server - Ubuntu 20.04 running Minikube v1.10.1, local ip 192.168.0.56, minikube ip 172.17.0.2
- Config:
  -- kubectl --accept-hosts='^.\*' --address='192.168.0.56' proxy
  -- nginx with sites-enabled -> nginx/reverse_proxy.conf (for access to ingress/application via local ip)
  -- minikube addons enable ingress
- Devbox - Macbook Pro running VS Code, kubectl client with context copied from Server
- Skaffold - skaffold.yaml.local for above setup, .gcp for running within GCP

# Notes/Todos

- Skaffold config for different kube contexts rather than separate files
- Work out how to access ingress from within K8s cluster when running on GCP K8s
- Resolving internal name of ingress:
  -- kubectl expose deployment ingress-nginx-controller -n kube-system --target-port=80 --type=ClusterIP
  -- kubectl exec -it client-depl-5865bbfcd7-vq8mb -- sh
  -- /app # nslookup ingress-nginx-controller.kube-system.svc.cluster.local
- Secrets
- kubectl create secret tls ticketing.dev --key ticketing.dev.key --cert ticketing.dev.crt
- kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
- kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=sk_test_Cc7ooi\***\*\*\*\*\*\***
- NOTE - secrets exported to my ~/.kube/ticketing-secrets.yaml but not in Git!
- TODO: document how to create the TLS certs (ticketing.dev.key/crt)
- to access client on Chrome need to type 'thisisunsafe' to get past the self-signed certificate issue

# Common Library

- Created an organisation within npmjs.com called gravitaz, invited my own account to team
- Create a new directory in my source tree called common
- -> npm init -y to create package.json
- edited package.json changing name to "@holmestm/common"
- -> npm login to my own account
- -> npm publish --access public
- we're going to write typescript but publish javascript
- -> tsc --init to add typescript (creates a tsconfig.json file)
- -> npm install typescript del-cli --save-dev
- edit tsconfig.json: uncomment declaration and set OutDir to ./build
- edit package.json: add clean
