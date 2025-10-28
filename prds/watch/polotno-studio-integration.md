# Polotno Studio Integration Tasks

## Overview

Mount a working Polotno editor on the main page of the existing Next.js app at `apps/studio` using the official Next example as reference. No server changes required - client-only render.

## Goals

- `/apps/studio/app/page.tsx` renders a full Polotno editor
- Build and dev server succeed with zero SSR errors
- Core Polotno UI (side panel, workspace, toolbar, zoom) visible and usable
- Styles load correctly (Blueprint + Polotno CSS)
- No TypeScript complaints

## Prerequisites

- [ ] Verify Next.js App Router setup in `/apps/studio`
- [ ] Confirm workspace configuration (pnpm workspace setup)
- [ ] Check existing TypeScript configuration

## Installation Tasks

### Dependency Installation

- [ ] Install Polotno and required dependencies:
  ```bash
  pnpm -w add polotno @blueprintjs/core @blueprintjs/icons rc-dock
  ```
- [ ] Verify React/React-DOM versions satisfy Polotno requirements
- [ ] Check for peer dependency conflicts in workspace

## File Structure Setup

### Global CSS Configuration

- [ ] Create or update `apps/studio/app/globals.css` with Polotno/Blueprint styles:
  ```css
  /* Polotno + Blueprint styles */
  @import '@blueprintjs/core/lib/css/blueprint.css';
  @import '@blueprintjs/icons/lib/css/blueprint-icons.css';
  @import 'polotno/css/polotno.css';
  ```
- [ ] Update `apps/studio/app/layout.tsx` to import `globals.css`
- [ ] Verify layout structure matches Next.js App Router conventions

### Client Editor Component

- [ ] Create `apps/studio/app/editor/` directory
- [ ] Create `apps/studio/app/editor/PolotnoEditor.tsx` with:
  - "use client" directive
  - Store creation with `useMemo`
  - PolotnoContainer with SidePanel, Workspace, Toolbar, ZoomButtons
  - Proper styling for full viewport height
- [ ] Add optional blank page seeding (commented out initially)

### Main Page Implementation

- [ ] Update `apps/studio/app/page.tsx` with:
  - Dynamic import of PolotnoEditor with `ssr: false`
  - Clean component export
- [ ] Ensure no SSR-related imports in server components

## Configuration Tasks

### TypeScript Configuration

- [ ] Verify `apps/studio/tsconfig.json` includes:
  - `"jsx": "preserve"`
  - Next.js default configurations
  - Proper type checking for Blueprint/Polotno
- [ ] Add `"skipLibCheck": true` if needed for rc-dock/blueprint type issues
- [ ] Confirm React namespace availability

### Nx/Monorepo Configuration

- [ ] Verify studio project target serves App Router app:
  ```bash
  nx run studio:serve
  ```
- [ ] Check `next.config.js|mjs` allows CSS imports from node_modules
- [ ] Confirm workspace dependency resolution

## Testing and Validation

### Development Server Testing

- [ ] Start dev server:
  ```bash
  pnpm --filter @apps/studio dev
  ```
- [ ] Verify app loads at configured port (default 3000)
- [ ] Check for SSR errors in console
- [ ] Confirm Polotno UI elements render:
  - Left side panel
  - Canvas workspace
  - Toolbar
  - Zoom controls

### Functionality Testing

- [ ] Test core interactions:
  - Add shape from side panel
  - Add text element
  - Move/resize elements
  - Export via toolbar menu
  - Undo/redo operations
- [ ] Verify responsive behavior
- [ ] Check for style regressions

### Build Testing

- [ ] Run production build:
  ```bash
  pnpm --filter @apps/studio build
  ```
- [ ] Verify zero build errors
- [ ] Check build output for SSR warnings
- [ ] Confirm CSS bundling success

## Troubleshooting Tasks

### Common Issue Resolution

- [ ] Fix "window is not defined" errors:
  - Verify "use client" directive
  - Confirm `ssr: false` in dynamic imports
- [ ] Resolve broken styles:
  - Check all CSS imports in globals.css
  - Verify layout.tsx imports globals.css
- [ ] Address TypeScript errors:
  - Add skipLibCheck if needed
  - Verify React type availability
- [ ] Fix blank canvas issues:
  - Ensure full viewport height styling
  - Check container dimensions

## Future Enhancement Planning

### Optional Features (Post-MVP)

- [ ] Template preloading with `store.openJson(json)`
- [ ] Local storage persistence on `store.save()` events
- [ ] Custom panels or tools composition
- [ ] Authentication gating (client-side only)

## Definition of Done

- [ ] Editor renders successfully at `/` of `apps/studio`
- [ ] No SSR crashes or style regressions in build output
- [ ] Basic authoring features functional:
  - Add text/image/shape elements
  - Undo/redo operations
  - Export functionality
- [ ] CI build passes for studio app
- [ ] Manual testing confirms core usability
- [ ] TypeScript compilation clean
- [ ] Dev server runs without errors
