cd /workspaces/core/resources/kube/api
kubectl apply -f api-gateway-main-deployment.yaml
kubectl apply -f api-journeys-main-deployment.yaml
kubectl apply -f api-users-main-deployment.yaml