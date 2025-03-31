#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Print with color
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    print_error "helm is not installed. Please install helm first."
    exit 1
fi

# Check if kubectl is installed and can access the cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Unable to access Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# First, apply the Doppler Secret configuration for staging
print_info "Applying Doppler Secret configuration from consolidated secrets-stage.yaml..."
kubectl apply -f ${SCRIPT_DIR}/../doppler/secrets-stage.yaml

# Wait for the Doppler Secret to be processed
print_info "Waiting for Doppler Secret to be processed (10 seconds)..."
sleep 10

# Check if the managed secret was created
if ! kubectl get secret externaldns-aws-credentials -n default &> /dev/null; then
    print_warning "The managed secret 'externaldns-aws-credentials' has not been created yet."
    print_warning "This might indicate an issue with the Doppler Operator or the configuration."
    print_warning "Please check that Doppler Operator is running:"
    echo "  kubectl get pods -n doppler-operator-system"
    print_warning "And check the Doppler Secret status:"
    echo "  kubectl get dopplersecret -n doppler-operator-system"
    
    print_info "Proceeding with deployment anyway. The external-dns deployment will wait for the secret."
fi

# Add the external-dns repository if not already added
if ! helm repo list | grep -q "external-dns"; then
    print_info "Adding external-dns helm repository..."
    helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
fi

# Update helm repositories
print_info "Updating helm repositories..."
helm repo update

# Create the namespace if it doesn't exist
if ! kubectl get namespace external-dns &> /dev/null; then
    print_info "Creating namespace external-dns..."
    kubectl create namespace external-dns
fi

# Copy the AWS credentials secret to the external-dns namespace
print_info "Copying AWS credentials secret to external-dns namespace..."
if kubectl get secret externaldns-aws-credentials -n default &> /dev/null; then
    # Export the secret from default namespace
    kubectl get secret externaldns-aws-credentials -n default -o yaml | \
    sed 's/namespace: default/namespace: external-dns/' | \
    kubectl apply -f - || true
    
    print_info "Secret copied successfully to external-dns namespace."
else
    print_warning "Could not copy the secret as it doesn't exist yet. The deployment might fail."
fi

# Deploy external-dns using Helm
print_info "Deploying external-dns for staging environment using Helm..."
helm upgrade --install external-dns external-dns/external-dns \
    --namespace external-dns \
    --values "${SCRIPT_DIR}/external-dns-values-stage.yaml" \
    --wait

# Verify the deployment
print_info "Verifying external-dns deployment..."
if kubectl get pods -n external-dns -l app.kubernetes.io/name=external-dns --field-selector status.phase=Running &> /dev/null; then
    print_info "external-dns deployed successfully!"
    
    # Check the logs for any errors
    print_info "Checking external-dns logs for errors..."
    POD_NAME=$(kubectl get pods -n external-dns -l app.kubernetes.io/name=external-dns -o jsonpath="{.items[0].metadata.name}")
    sleep 5
    kubectl logs $POD_NAME -n external-dns | grep -i "error" || true
else
    print_error "Deployment verification failed. Please check the logs:"
    echo "kubectl logs -l app.kubernetes.io/name=external-dns -n external-dns"
    exit 1
fi

print_info "External-DNS deployment with Helm completed for staging environment."
print_info "The DNS record for analytics.stage.central.jesusfilm.org should be updated within a few minutes."
print_info "You can verify the logs with: kubectl logs -l app.kubernetes.io/name=external-dns -n external-dns" 