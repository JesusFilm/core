helm repo add zekker6 https://zekker6.github.io/helm-charts/
helm repo update
helm install plausible-analytics zekker6/plausible-analytics -f values.yaml