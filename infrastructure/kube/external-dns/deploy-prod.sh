#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Check if kubectl is installed and can access the cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Unable to access Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# First, apply the Doppler Secret configuration
print_info "Applying Doppler Secret configuration from consolidated secrets.yaml..."
kubectl apply -f ../doppler/secrets.yaml

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

# Apply the external-dns deployment for production
print_info "Applying external-dns deployment for production..."
kubectl apply -f externaldns-deployment-prod.yaml

# Restart the external-dns deployment if it exists
if kubectl get deployment external-dns -n default &> /dev/null; then
    print_info "Restarting external-dns deployment..."
    kubectl rollout restart deployment external-dns -n default
    
    # Verify the deployment
    print_info "Waiting for external-dns deployment to be ready..."
    kubectl rollout status deployment external-dns -n default
    
    print_info "Checking external-dns logs for AWS credential errors..."
    POD_NAME=$(kubectl get pods -l app.kubernetes.io/name=external-dns -n default -o jsonpath="{.items[0].metadata.name}")
    sleep 10
    kubectl logs $POD_NAME -n default | grep -i "credentials" || true
    kubectl logs $POD_NAME -n default | grep -i "error" || true
else
    print_info "The external-dns deployment was not found. It has been applied and should start shortly."
fi

print_info "External-DNS production deployment with Doppler integration completed."
print_info "The DNS records for production domains should be updated within a few minutes."
print_info "You can verify the logs with: kubectl logs -l app.kubernetes.io/name=external-dns -n default" 