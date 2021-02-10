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

Develop on Windows, back end on MacOS

- Mac - run Docker Desktop with Kubernetes enabled
  -- kubectl proxy -- address 0.0.0.0 --accept-hosts ".*" --disable-filter=true
  -- run docker run -d --name docker_remote --restart unless-stopped -p 2375:2375 -v /var/run/docker.sock:/var/run/docker.sock holmestm/docker-remote-api:latest
- Windows - create contexts for docker and kubernetes via
  -- Docker:  docker context create macbook --docker "host=tcp://192.168.0.17:2375" --kubernetes "config-file=/home/tim/.kube/mac-config"
  -- Kubernetes scp config from Mac to Windows as above with server=http://192.168.0.17:8001 (i.e. kubectl proxy)

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

# CI Process
1. Added npm test:ci to package.json in auth to permit single pass test
2. Created tests.yaml in Github using Actions tab
3. Modified index.js in auth/src/index.ts
4. git checkout -b dev - to create dev branch
5. git add . - to add changes to that branch
6. git commit -m "message"
7. git push origin dev
8. follow message in output to create a pull request in Github or go to github repo, select Pull Requests tab
9. Click on New pull request to create a manual request
10. Select 'compare' dropdown and pick dev
11. Click on 'Create Pull Request' - allow tests to complete 
12. Click on 'submit pull request' - 

# Certification Process (in progress)

This section discusses how we get Kubernetes generate a SSL certificate for our publically accessible domain name. Ref: [How to Set Up an Nginx Ingress with Cert-Manager on DigitalOcean Kubernetes](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes) - starting from section 4

1. kubectl create namespace cert-manager
2. kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.12.0/cert-manager.yaml
3. create and apply new issuer.yaml
4. updated ingres-srv.yaml in k8s-prod subdirectory
5. apply via pull-request etc.
6. Check certificate using kubectl describe certificates
7. Check Message and wait until complete

# Security Implementation

Authentication occurs through React login or signup front end, either posting username/password to auth signin or signup endpoints. Success will result in a JWT being added to a cookie based session store through the npmjs module cookie-session. App assumes APIs will be called with a jwt encoded in a cookie with name expess:sess e.g.
```
Cookie: express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtTWpBek5EaGhaVEUxWkRVMU1EQXhPREZsWkdWbU5pSXNJbVZ0WVdsc0lqb2lhVFZoYW0xQWRHVnpkQzVqYjIwaUxDSnBZWFFpT2pFMU9UVTVORFl4TWpkOS5rWXBwa0JRTVhCY2dNVXQ4ZUtOVEhDbTczSTJITE9CTGJ6YkY1SjZtbWFFIn0=
```
which translates to 
```
{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMjAzNDhhZTE1ZDU1MDAxODFlZGVmNiIsImVtYWlsIjoiaTVham1AdGVzdC5jb20iLCJpYXQiOjE1OTU5NDYxMjd9.kYppkBQMXBcgMUt8eKNTHCm73I2HLOBLbzbF5J6mmaE"}
```
pasting this into jwt.io gives
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}
Payload:
{
  "id": "5f20348ae15d5500181edef6",
  "email": "i5ajm@test.com",
  "iat": 1595946127
}
```
Designing microservices to accept security tokens using cookies isn't ideal, since not all clients will understand cookies. Rather the mechanism should be as an Authorisation header with value 'Bearer XXX' where XXX=base64 encoded jwt

# Use of Mongoose optimistic concurrency control to ensure data consistency on update events

The Nats streaming service does not guarantee to deliver messages in order, so to ensure consistency of data in this asynchronous flow we use Mongo versioning to ensure updates are only applied in the correct order. Each entity record in Mongo has a version key which by default has the name __V. By adopted convention we tell Mongo to change this attribute to 'version' using the <schema>.set('versionKey', 'version'). We then tell Mongo to apply optimistic version control using <schema>.plugin(updateIfCurrentPlugin). This only really applies on update operations, and we can see it in action in the ticket-updated-lister.ts file of the orders microservice. When we receive a message that tells us to update a ticket record in the order database, we only process the update if the entity in the database has a version 1 less that the version number in the message. If it doesn't we throw an error and ignore the message. We expect Nats to try again later, which means we don't lose messages. 
