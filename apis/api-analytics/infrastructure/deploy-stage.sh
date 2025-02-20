kubectl apply -f storage-class.yaml
kubectl apply -f snapshot-class.yaml
helm repo add zekker6 https://zekker6.github.io/helm-charts/
helm repo update
helm upgrade --install plausible-analytics zekker6/plausible-analytics -f values-stage.yaml --kube-context=stage
kubectl apply -f snapscheduler.yaml