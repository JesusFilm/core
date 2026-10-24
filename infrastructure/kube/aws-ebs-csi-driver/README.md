# AWS EBS CSI Driver (Argo CD + Helm)

Argo CD deploys this wrapper Helm chart via:

- `infrastructure/kube/argocd/applications/stage/aws-ebs-csi-driver.yaml`
- `infrastructure/kube/argocd/applications/prod/aws-ebs-csi-driver.yaml`

This chart wraps the upstream `aws-ebs-csi-driver` Helm chart (see `Chart.yaml` dependencies) and applies environment-specific values from this repo.

Argo CD is the only owner in both environments. Do not also install the native
EKS `aws-ebs-csi-driver` add-on, and do not run `deploy-stage.sh` or
`deploy-prod.sh`: both delete that add-on and rewrite the IRSA trust policy,
which is already correct. The production Argo application does not sync
automatically, so sync it by hand after a change merges to `main`.

Snapshots are deployed separately via the `snapshot-controller` Argo CD Applications.
