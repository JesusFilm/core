# AWS EBS CSI Driver (Argo CD + Helm)

Argo CD deploys this wrapper Helm chart via:

- `infrastructure/kube/argocd/applications/stage/aws-ebs-csi-driver.yaml`
- `infrastructure/kube/argocd/applications/prod/aws-ebs-csi-driver.yaml`

This chart wraps the upstream `aws-ebs-csi-driver` Helm chart (see `Chart.yaml` dependencies) and applies environment-specific values from this repo.

Snapshots are deployed separately via the `snapshot-controller` Argo CD Applications.
