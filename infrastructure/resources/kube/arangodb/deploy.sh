kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.7/manifests/arango-crd.yaml
kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.7/manifests/arango-deployment.yaml
# To use `ArangoLocalStorage`, also run
# kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.7/manifests/arango-storage.yaml
# To use `ArangoDeploymentReplication`, also run
# kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.7/manifests/arango-deployment-replication.yaml

kubectl apply -f /workspaces/core/resources/kube/arangodb