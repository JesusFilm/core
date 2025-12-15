#!/usr/bin/env bash
set -euo pipefail

# Pin the Argo CD version so Renovate can automatically open PRs to update it.
ARGOCD_VERSION="${ARGOCD_VERSION:-v2.11.0}"

if ! kubectl get namespace argocd >/dev/null 2>&1; then
  kubectl create namespace argocd
fi

kubectl apply -n argocd -f "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"