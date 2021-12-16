kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.5/manifests/arango-crd.yaml
kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.5/manifests/arango-deployment.yaml
# To use `ArangoLocalStorage`, also run
#kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.5/manifests/arango-storage.yaml
cd /workspaces/core/resources/kube/arangodb
kubectl apply -f ./arangodb-deployment.yaml 