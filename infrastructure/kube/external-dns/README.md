# External-DNS for AWS Route53

This directory contains configuration files for deploying External-DNS to manage DNS records in AWS Route53.

## Overview

External-DNS automatically manages DNS records in AWS Route53 based on Kubernetes resources like Services and Ingresses. This helps ensure that your applications are always accessible at the correct DNS addresses, even when the underlying infrastructure changes.

## Prerequisites

- A Kubernetes cluster with access to AWS Route53
- Doppler Kubernetes Operator installed in the cluster
- AWS credentials stored in Doppler for both environments:
  - Staging: project: `kubernetes`, config: `stage`
  - Production: project: `kubernetes`, config: `prod`
- Helm

## Deployment

### Helm-based Deployment

This setup uses Helm to deploy the official External-DNS chart with Doppler Kubernetes Operator for managing secrets.

#### Staging Environment

```bash
# Run the Helm staging deployment script
./deploy-helm.sh
```

The script will:

1. Apply the Doppler Secret configuration from the consolidated `secrets-stage.yaml`
2. Add the External-DNS Helm repository and update it
3. Create a namespace for External-DNS if it doesn't exist
4. Deploy the External-DNS Helm chart using the `external-dns-values-stage.yaml` file
5. Verify that everything is working correctly

#### Production Environment

```bash
# Run the Helm production deployment script
./deploy-helm-prod.sh
```

The production script follows the same pattern but uses:

1. The `secrets.yaml` file with production configurations
2. The production-specific values file `external-dns-values-prod.yaml`

## Configuration

### Doppler Secret Configuration

#### Staging Environment

The External-DNS credentials for staging are defined in the consolidated `secrets-stage.yaml` file:

```yaml
apiVersion: secrets.doppler.com/v1alpha1
kind: DopplerSecret
metadata:
  name: externaldns-aws-credentials
  namespace: doppler-operator-system
spec:
  tokenSecret:
    name: doppler-token-secret
  project: kubernetes
  config: stage
  managedSecret:
    name: externaldns-aws-credentials
    namespace: default
```

#### Production Environment

The External-DNS credentials for production are defined in the consolidated `secrets.yaml` file:

```yaml
apiVersion: secrets.doppler.com/v1alpha1
kind: DopplerSecret
metadata:
  name: externaldns-aws-credentials-prod
  namespace: doppler-operator-system
spec:
  tokenSecret:
    name: doppler-token-secret
  project: kubernetes
  config: prod
  managedSecret:
    name: externaldns-aws-credentials
    namespace: default
```

### External-DNS Configuration

The Helm values files (`external-dns-values-stage.yaml` and `external-dns-values-prod.yaml`) contain all the necessary configuration for the External-DNS deployment, including:

- AWS provider and region settings
- Credentials configuration using secrets
- Domain filters
- Zone ID filters
- Ingress class configuration
- Policy settings
- Registry configurations
- RBAC settings

#### Staging Environment

The staging External-DNS deployment is configured with:

- **Domain Filter**: `stage.central.jesusfilm.org` (only manages records for this domain)
- **Zone ID Filter**: `Z09188583TUYV562FI49B` (specific Route53 hosted zone ID)
- **Ingress Class**: `nginx` (only manages ingress resources with this class)
- **AWS Region**: `us-east-2`
- **Policy**: `upsert-only` (prevents deletion of existing records)
- **Zone Type**: `public` (only manages public hosted zones)
- **TXT Owner ID**: `external-dns`

#### Production Environment

The production External-DNS deployment is configured with:

- **Domain Filter**: `central.jesusfilm.org` (only manages records for this domain)
- **Zone ID Filter**: `Z06687872LMUIKS0Y291P` (specific Route53 hosted zone ID)
- **Ingress Class**: `nginx` (only manages ingress resources with this class)
- **AWS Region**: `us-east-2`
- **Policy**: `upsert-only` (prevents deletion of existing records)
- **Zone Type**: `public` (only manages public hosted zones)
- **TXT Owner ID**: `external-dns-production`

## Troubleshooting

If DNS records are not being updated, check:

1. Doppler Secret status:

   ```bash
   kubectl get dopplersecret -n doppler-operator-system
   ```

2. Check if the managed secret exists:

   ```bash
   kubectl get secret externaldns-aws-credentials -n default
   ```

3. External-DNS pod logs:

   ```bash
   kubectl logs -l app.kubernetes.io/name=external-dns -n external-dns
   ```

4. Check ingress resources:

   ```bash
   kubectl get ingress --all-namespaces
   ```

5. Verify DNS records in Route53:

   ```bash
   # For staging
   aws route53 list-resource-record-sets --hosted-zone-id Z09188583TUYV562FI49B

   # For production
   aws route53 list-resource-record-sets --hosted-zone-id Z06687872LMUIKS0Y291P
   ```

## Required AWS Permissions

External-DNS requires the following AWS permissions:

- `route53:ChangeResourceRecordSets`
- `route53:ListHostedZones`
- `route53:ListResourceRecordSets`

These permissions should be associated with the AWS credentials stored in Doppler.

## Required Doppler Secrets

The following secrets should be configured in the Doppler project `kubernetes`:

### For `stage` Config:

- `AWS_ACCESS_KEY_ID` - AWS access key with Route53 permissions
- `AWS_SECRET_ACCESS_KEY` - Corresponding AWS secret key

### For `prod` Config:

- `AWS_ACCESS_KEY_ID` - AWS access key with Route53 permissions
- `AWS_SECRET_ACCESS_KEY` - Corresponding AWS secret key
