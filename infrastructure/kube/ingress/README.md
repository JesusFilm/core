# Helm Charts

## NGINX Ingress Controller

This directory contains the values file for deploying the NGINX Ingress Controller using the official Helm chart.

### Installation

1. Add the ingress-nginx repository:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

2. Install the chart:

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --values ingress-nginx-values.yaml
```

### Upgrading

To upgrade the existing installation:

```bash
helm upgrade ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --values ingress-nginx-values.yaml
```

### Uninstalling

To uninstall/delete the deployment:

```bash
helm uninstall ingress-nginx -n ingress-nginx
```

### Configuration

The configuration values are stored in `ingress-nginx-values.yaml`. This file contains the custom values that override the default chart values. Key configurations include:

- Controller image version: v1.10.1
- Resource requests
- Service type: LoadBalancer
- RBAC and ServiceAccount settings

For more configuration options, refer to the [official documentation](https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx).
