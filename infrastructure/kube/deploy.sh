#!/usr/bin/env bash
set -euo pipefail

echo "aws-auth is now managed by Argo CD:"
echo "- prod:  infrastructure/kube/argocd/applications/prod/aws-auth.yaml"
echo "- stage: infrastructure/kube/argocd/applications/stage/aws-auth.yaml"