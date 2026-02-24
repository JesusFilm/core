# UI Components Library

This library contains shared shadcn/ui components for the monorepo. Built with [shadcn/ui](https://ui.shadcn.com/) and [Nx](https://nx.dev).

## Adding New Shadcn Components

**⚠️ IMPORTANT**: Always use the automated script to add new shadcn components. This ensures dependencies are installed at the monorepo root level, not in this library.

### Using the Automated Script

```bash
cd libs/shared/ui-modern
./add-shadcn-component.sh <component-name>
```

Example:

```bash
./add-shadcn-component.sh button
./add-shadcn-component.sh dialog
```

### What the Script Does

1. Installs required dependencies at the monorepo root level
2. Adds the component to `src/components/`
3. Updates exports in `src/index.ts`

### Manual Process (Not Recommended)

If you must add components manually:

1. Install dependencies at root: `pnpm add @radix-ui/<component>`
2. Run shadcn from this directory: `npx shadcn@latest add <component> --yes`
3. Remove any dependencies that were added to this library's package.json

## Available Components

- accordion
- badge
- button
- card
- checkbox
- command
- dialog
- input
- popover
- tabs
- textarea

## Usage

Import components from the shared library:

```typescript
import { Button } from '@core/shared/ui-modern/components/button'
```

## Running unit tests

Run `nx test ui-modern` to execute the unit tests via [Jest](https://jestjs.io).
