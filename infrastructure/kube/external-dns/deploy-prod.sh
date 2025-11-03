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

# Apply the Doppler Secret configuration for production
print_info "Applying Doppler Secret configuration from consolidated secrets.yaml..."
kubectl apply -f ${SCRIPT_DIR}/../doppler/secrets.yaml

# Wait for the Doppler Secret to be processed
print_info "Waiting for Doppler Secret to be processed (20 seconds)..."
sleep 20

# Check Doppler secret status to ensure it's working correctly
print_info "Checking Doppler secret status..."
SECRET_STATUS=$(kubectl get dopplersecret -n doppler-operator-system externaldns-aws-credentials-prod -o jsonpath='{.status.conditions[?(@.type=="secrets.doppler.com/SecretSyncReady")].status}' 2>/dev/null || echo "NotFound")

if [ "$SECRET_STATUS" != "True" ]; then
    print_warning "Doppler secret sync is not ready. Checking for errors..."
    ERROR_MESSAGE=$(kubectl get dopplersecret -n doppler-operator-system externaldns-aws-credentials-prod -o jsonpath='{.status.conditions[?(@.type=="secrets.doppler.com/SecretSyncReady")].message}' 2>/dev/null || echo "Unknown error")
    print_warning "Error: $ERROR_MESSAGE"
    
    if [[ "$ERROR_MESSAGE" == *"does not have access to requested project"* ]]; then
        print_error "The Doppler token does not have access to the 'kubernetes' project."
        print_error "Please update the Doppler token permissions and try again."
        exit 1
    fi
fi

# Check if the managed secret was created
if ! kubectl get secret externaldns-aws-credentials -n default &> /dev/null; then
    print_warning "The managed secret 'externaldns-aws-credentials' has not been created yet."
    print_warning "Checking Doppler operator status..."
    kubectl get pods -n doppler-operator-system
    print_warning "Checking DopplerSecret status:"
    kubectl describe dopplersecret -n doppler-operator-system externaldns-aws-credentials-prod
    
    print_error "Doppler secret was not created. Please fix the Doppler configuration and try again."
    exit 1
else
    print_info "Doppler secret was created successfully!"
    
    # Create the namespace if it doesn't exist
    if ! kubectl get namespace external-dns &> /dev/null; then
        print_info "Creating namespace external-dns..."
        kubectl create namespace external-dns
    fi
    
    # Copy the AWS credentials secret to the external-dns namespace
    print_info "Copying AWS credentials secret to external-dns namespace..."
    kubectl get secret externaldns-aws-credentials -n default -o yaml | \
    sed 's/namespace: default/namespace: external-dns/' | \
    kubectl apply -f - || true
    
    print_info "Secret copied successfully to external-dns namespace."
fi

# Add the external-dns repository if not already added
if ! helm repo list | grep -q "external-dns"; then
    print_info "Adding external-dns helm repository..."
    helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
fi

# Update helm repositories
print_info "Updating helm repositories..."
helm repo update

# Deploy external-dns using Helm with force flag to overwrite resources
print_info "Deploying external-dns for production environment using Helm..."
print_info "This may take a few minutes..."

# Deploy with an increased timeout (10 minutes)
if ! helm upgrade --install external-dns external-dns/external-dns \
    --namespace external-dns \
    --values "${SCRIPT_DIR}/external-dns-values-prod.yaml" \
    --force \
    --timeout 10m0s; then
    
    print_error "Helm deployment failed. Checking for error details..."
    kubectl get events -n external-dns --sort-by='.lastTimestamp' | tail -n 20
    print_error "Deployment failed. You may need to check the cluster for more details."
    exit 1
fi

# Verify the deployment
print_info "Verifying external-dns deployment..."

# Wait for up to 2 minutes for the pod to be running
TIMEOUT=120
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if kubectl get pods -n external-dns -l app.kubernetes.io/name=external-dns --field-selector status.phase=Running &> /dev/null; then
        print_info "external-dns deployed successfully!"
        break
    fi
    
    print_info "Waiting for external-dns pod to be running ($ELAPSED/$TIMEOUT seconds)..."
    sleep 10
    ELAPSED=$((ELAPSED+10))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    print_error "Timed out waiting for external-dns pod to be in Running state."
    print_error "Current pod status:"
    kubectl get pods -n external-dns
    kubectl describe pods -n external-dns -l app.kubernetes.io/name=external-dns
    exit 1
fi

# Check the logs for any errors
print_info "Checking external-dns logs for errors..."
POD_NAME=$(kubectl get pods -n external-dns -l app.kubernetes.io/name=external-dns -o jsonpath="{.items[0].metadata.name}")
sleep 5
kubectl logs $POD_NAME -n external-dns | grep -i "error" || true

print_info "External-DNS deployment with Helm completed for production environment."
print_info "The DNS record for analytics.central.jesusfilm.org should be updated within a few minutes."
print_info "You can verify the logs with: kubectl logs -l app.kubernetes.io/name=external-dns -n external-dns" 