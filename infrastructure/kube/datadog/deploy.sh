helm repo add datadog https://helm.datadoghq.com
helm upgrade --install datadog-operator datadog/datadog-operator
kubectl create secret generic datadog-secret --from-literal api-key=<DATADOG_API_KEY>
