# helm repo add jetstack https://charts.jetstack.io
# helm repo update
# kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.6.1/cert-manager.crds.yaml
# helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.6.1 --set webhook.hostNetwork=true --set webhook.securePort=10555
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.6.1/cert-manager.yaml