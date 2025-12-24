# Argo CD (GitOps) + Renovate

This repo uses Argo CD `Application` manifests in `infrastructure/kube/argocd/applications/**` to deploy a set of Kubernetes apps.

## Renovate support

Renovate is configured in `renovate.json` to:

- Update **Argo CD Applications** (e.g. upstream Helm chart versions referenced in `infrastructure/kube/argocd/applications/**`).
- Update **Helm values** under `infrastructure/kube/**` (e.g. image tags in `values*.yaml`), including Argo multi-source `$values/` files.
- Update the pinned **Argo CD install manifest version** used by `infrastructure/kube/argocd/deploy.sh` via a regex manager.

## Installing Argo CD

`infrastructure/kube/argocd/deploy.sh` installs Argo CD from a pinned release tag (via `ARGOCD_VERSION`) so dependency updates can be automated.
