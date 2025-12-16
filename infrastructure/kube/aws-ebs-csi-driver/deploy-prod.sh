#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec /usr/bin/env bash "$0" "$@"
fi
set -euo pipefail

# This script is for provisioning the IAM role used by EBS CSI via IRSA.
#
# IMPORTANT:
# - If you deploy aws-ebs-csi-driver via Argo CD + Helm (see `infrastructure/kube/argocd/applications/**`),
#   do NOT also install the EKS managed addon unless you explicitly intend to run the addon.
#   Running both can lead to conflicts and IRSA 403s if service accounts/ownership differ.
#
# To install the EKS managed addon, set INSTALL_EKS_ADDON=true.
INSTALL_EKS_ADDON="${INSTALL_EKS_ADDON:-false}"

CLUSTER_NAME="${CLUSTER_NAME:-jfp-eks-prod}"
AWS_REGION="${AWS_REGION:-us-east-2}"
ADDON_NAME="${ADDON_NAME:-aws-ebs-csi-driver}"
ROLE_NAME="${ROLE_NAME:-AmazonEKS_EBS_CSI_DriverRole_prod}"
K8S_NAMESPACE="${K8S_NAMESPACE:-kube-system}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-ebs-csi-controller-sa}"

delete_eks_addon_if_present() {
  # If the addon exists, delete it so Helm/Argo can manage the driver without conflicts.
  if aws eks describe-addon --region "${AWS_REGION}" --cluster-name "${CLUSTER_NAME}" --addon-name "${ADDON_NAME}" >/dev/null 2>&1; then
    echo "Deleting EKS addon '${ADDON_NAME}' from cluster '${CLUSTER_NAME}' (region: ${AWS_REGION})..."
    aws eks delete-addon --region "${AWS_REGION}" --cluster-name "${CLUSTER_NAME}" --addon-name "${ADDON_NAME}" >/dev/null

    # Wait until the addon is gone (or deletion completes).
    while aws eks describe-addon --region "${AWS_REGION}" --cluster-name "${CLUSTER_NAME}" --addon-name "${ADDON_NAME}" >/dev/null 2>&1; do
      echo "Waiting for addon '${ADDON_NAME}' deletion..."
      sleep 10
    done
  fi
}

delete_eks_addon_if_present

ensure_irsa_trust_policy_matches_service_account() {
  local aws_account_id
  aws_account_id="$(aws sts get-caller-identity --query Account --output text)"

  local oidc_issuer
  oidc_issuer="$(aws eks describe-cluster --region "${AWS_REGION}" --name "${CLUSTER_NAME}" --query 'cluster.identity.oidc.issuer' --output text)"

  if [[ -z "${oidc_issuer}" ]]; then
    echo "Unable to determine OIDC issuer for cluster '${CLUSTER_NAME}'."
    exit 1
  fi

  local oidc_provider_hostpath
  oidc_provider_hostpath="${oidc_issuer#https://}"

  local oidc_provider_arn
  oidc_provider_arn="arn:aws:iam::${aws_account_id}:oidc-provider/${oidc_provider_hostpath}"

  local policy_template_file
  policy_template_file="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/irsa-assume-role-policy.template.json"

  if [[ ! -f "${policy_template_file}" ]]; then
    echo "Missing policy template: ${policy_template_file}"
    exit 1
  fi

  local policy_file
  policy_file="$(mktemp)"
  sed \
    -e "s|__OIDC_PROVIDER_ARN__|${oidc_provider_arn}|g" \
    -e "s|__OIDC_PROVIDER_HOSTPATH__|${oidc_provider_hostpath}|g" \
    -e "s|__K8S_NAMESPACE__|${K8S_NAMESPACE}|g" \
    -e "s|__SERVICE_ACCOUNT_NAME__|${SERVICE_ACCOUNT_NAME}|g" \
    "${policy_template_file}" > "${policy_file}"

  echo "Updating IAM role trust policy for '${ROLE_NAME}' to allow '${K8S_NAMESPACE}/${SERVICE_ACCOUNT_NAME}'..."
  aws iam update-assume-role-policy --role-name "${ROLE_NAME}" --policy-document "file://${policy_file}"

  rm -f "${policy_file}"
}

eksctl create iamserviceaccount \
  --region "${AWS_REGION}" \
  --name "${SERVICE_ACCOUNT_NAME}" \
  --namespace "${K8S_NAMESPACE}" \
  --cluster "${CLUSTER_NAME}" \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name "${ROLE_NAME}"

ensure_irsa_trust_policy_matches_service_account

if [[ "${INSTALL_EKS_ADDON}" == "true" ]]; then
  eksctl create addon \
    --name aws-ebs-csi-driver \
    --cluster "${CLUSTER_NAME}" \
    --service-account-role-arn arn:aws:iam::410965620680:role/AmazonEKS_EBS_CSI_DriverRole_prod \
    --force
fi
