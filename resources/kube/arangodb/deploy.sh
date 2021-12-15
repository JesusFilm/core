kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.5/manifests/arango-crd.yaml
kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.5/manifests/arango-deployment.yaml
# To use `ArangoLocalStorage`, also run
#kubectl apply -f https://raw.githubusercontent.com/arangodb/kube-arangodb/1.2.5/manifests/arango-storage.yaml

kubectl apply -f ./prod-server.yaml
kubectl apply -f ./stage-server.yaml