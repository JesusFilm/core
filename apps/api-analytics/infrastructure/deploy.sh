helm repo add zekker6 https://zekker6.github.io/helm-charts/
helm repo update
helm upgrade --install plausible-analytics zekker6/plausible-analytics -f values-prod.yaml --kube-context=prod
helm upgrade --install plausible-analytics zekker6/plausible-analytics -f values-stage.yaml --kube-context=stage