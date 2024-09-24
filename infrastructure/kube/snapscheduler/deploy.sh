helm repo add backube https://backube.github.io/helm-charts/
kubectl create namespace snapscheduler
helm install -n snapscheduler snapscheduler backube/snapscheduler