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

# Add the ingress-nginx repository if not already added
if ! helm repo list | grep -q "ingress-nginx"; then
    print_info "Adding ingress-nginx helm repository..."
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
fi

# Update helm repositories
print_info "Updating helm repositories..."
helm repo update

# Create namespace if it doesn't exist
if ! kubectl get namespace ingress-nginx &> /dev/null; then
    print_info "Creating namespace ingress-nginx..."
    kubectl create namespace ingress-nginx
fi

print_info "Deploying ingress-nginx using Helm..."
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --values "${SCRIPT_DIR}/ingress-nginx-values.yaml" \
    --wait

# Verify the deployment
if kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --field-selector status.phase=Running &> /dev/null; then
    print_info "Ingress NGINX controller deployed successfully!"
    
    # Get the external IP/hostname
    print_info "Waiting for LoadBalancer IP/hostname..."
    for i in {1..30}; do
        EXTERNAL_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        if [ -n "$EXTERNAL_IP" ]; then
            print_info "LoadBalancer hostname: $EXTERNAL_IP"
            break
        fi
        sleep 2
    done
    
    if [ -z "$EXTERNAL_IP" ]; then
        print_warning "LoadBalancer hostname not yet available. Please check manually with: kubectl get svc -n ingress-nginx ingress-nginx-controller"
    fi
else
    print_error "Deployment verification failed. Please check the logs:"
    echo "kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx"
    exit 1
fi 