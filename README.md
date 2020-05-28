# microservices-ticketing

Brief notes for me.
* Node backends
* React front end
* Deploy via Docker/Kubernetes

# K8s

* GCP - unable to access Ingress internally - check if Expose frees this up
* Microk8s - issue with ingress-nginx on old CPUs so using minikube, ran with local registry following guidelines on Ubuntu site

# My Setup

* Server - Ubuntu 20.04 running Minikube v1.10.1, local ip 192.168.0.56, minikube ip 172.17.0.2
* Config:
-- kubectl --accept-hosts='^.*' --address='192.168.0.56' proxy
-- nginx with sites-enabled -> nginx/reverse_proxy.conf (for access to ingress/application via local ip)
-- minikube addons enable ingress
* Devbox - Macbook Pro running VS Code, kubectl client with context copied from Server
* Skaffold - skaffold.yaml.local for above setup, .gcp for running within GCP

# Notes/Todos

* Skaffold config for different kube contexts rather than separate files
* Work out how to access ingress from within K8s cluster when running on GCP K8s
* Resolving internal name of ingress:
--   kubectl expose deployment ingress-nginx-controller -n kube-system --target-port=80 --type=ClusterIP
--   kubectl exec -it client-depl-5865bbfcd7-vq8mb -- sh
--   /app # nslookup ingress-nginx-controller.kube-system.svc.cluster.local 

# Common Library
* Created an organisation within npmjs.com called gravitaz, invited my own account to team
* Create a new directory in my source tree called common
* -> npm init -y to create package.json
* edited package.json changing name to "@holmestm/common"
* -> npm login to my own account
* -> npm publish --access public
* we're going to write typescript but publish javascript
* -> tsc --init to add typescript (creates a tsconfig.json file)
* -> npm install typescript del-cli --save-dev
* edit tsconfig.json: uncomment declaration and set OutDir to ./build
* edit package.json: add clean