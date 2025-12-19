#!/bin/bash

# Script to add shadcn components in the monorepo
# Usage: ./add-shadcn-component.sh <component-name>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <component-name>"
    exit 1
fi

COMPONENT=$1
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

echo "Installing dependencies for $COMPONENT at root level..."
cd "$ROOT_DIR"
pnpm add "@radix-ui/$COMPONENT" 2>/dev/null || pnpm add "$COMPONENT" 2>/dev/null || echo "Could not auto-detect dependency, please install manually"

echo "Adding $COMPONENT component..."
cd "libs/shared/ui-modern"
npx shadcn@latest add "$COMPONENT" --yes

echo "Done! Component added to libs/shared/ui-modern/src/components/$COMPONENT.tsx"
