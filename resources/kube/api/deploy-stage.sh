cd /workspaces/core/resources/kube/api
kubectl apply -f api-gateway-stage-deployment.yaml
kubectl apply -f api-journeys-stage-deployment.yaml
kubectl apply -f api-users-stage-deployment.yaml