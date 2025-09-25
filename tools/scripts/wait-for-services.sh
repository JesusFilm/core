#!/bin/bash
#
# Wait for Services Script
# This script waits for all required services to be healthy before starting the gateway
# This gets run from "nf start".
#
# Checks health check endpoints for each service
# Waits up to MAX_ATTEMPTS attempts, x SLEEP_INTERVAL seconds, per service
# Requires `curl` to be installed.
############################################################################################

set -e

SLEEP_INTERVAL=2
MAX_ATTEMPTS=60
# This is a total of 2 minutes of wait time (for each service checked).
# Why 2 minutes? Becuase it can take upto 2 minutes for everything to start.

# Service URLs - sourced from environment variables with fallback to localhost
ANALYTICS_URL="${ANALYTICS_URL:-http://localhost:4008}"
JOURNEYS_URL="${JOURNEYS_URL:-http://localhost:4001}"
LANGUAGES_URL="${LANGUAGES_URL:-http://localhost:4003}"
MEDIA_URL="${MEDIA_URL:-http://localhost:4005}"
USERS_URL="${USERS_URL:-http://localhost:4002}"
JOURNEYS_MODERN_URL="${JOURNEYS_MODERN_URL:-http://localhost:4004}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is healthy
check_service_health() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-$MAX_ATTEMPTS}
    local attempt=1
    
    print_status "Waiting for $service_name to be ready at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready on ${url}!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - gateway startup is waiting for $service_name..."
        
        sleep $SLEEP_INTERVAL
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to become ready after $max_attempts attempts on ${url}"
    return 1
}

# Main function
main() {
    print_status "Starting service dependency checks..."
    
    # Check if required tools are available
    if ! command -v curl > /dev/null 2>&1; then
        print_error "curl is required but not installed. Please install curl and try again."
        exit 1
    fi
    
    # Wait for all services to be ready
    local services_ready=true
    
    # Define services to check (name:url pairs)
    local services=(
        "Analytics|${ANALYTICS_URL}"
        "Journeys|${JOURNEYS_URL}"
        "Languages|${LANGUAGES_URL}"
        "Media|${MEDIA_URL}"
        "Users|${USERS_URL}"
        "Journeys Modern|${JOURNEYS_MODERN_URL}"
    )

    # Check each service
    for service in "${services[@]}"; do
        local service_name="${service%%|*}"
        local service_url="${service##*|}"

        if ! check_service_health "$service_name" "${service_url}/.well-known/apollo/server-health" $MAX_ATTEMPTS; then
            services_ready=false
            break
        fi
    done

    if [ "$services_ready" = true ]; then
        print_success "All services are ready! Starting gateway..."
        return 0
    else
        print_error "Not all services are ready. Gateway will not start."
        return 1
    fi
}

# Run main function
main "$@"
