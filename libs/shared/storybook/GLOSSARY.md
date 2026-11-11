# Storybook (component-catalog shell)

The monorepo-wide component catalog (`libs/shared/storybook`): a source-less shell project that runs the single root Storybook, aggregating every registered project's stories into one browsable catalog and one Visual Regression build. Owns no components and no code of its own; pure aggregation.

## Language

**Shell Project**:
This library — an Nx project with no source, only targets (`demo`, `build-storybook`) pointing at the Root Config. Its `implicitDependencies` make Nx treat any registered project's change as a change to the catalog.
_Avoid_: dummy library (its README's word — accurate but unsearchable)

**Root Config**:
The single `.storybook/` directory at the repo root, shared by the shell and every UI project. A project joins the catalog by adding its story glob to `storiesForProject` there (and to the shell's `implicitDependencies`).

**Registered Project**:
A project whose stories appear in the catalog. Includes UI surfaces (journeys, journeys-admin, watch, videos-admin, journeys-ui, shared-ui) and the email templates of API projects (api-journeys, api-users) — stories are not frontend-only.

**Visual Regression (VR)**:
The Chromatic snapshot comparison run over the catalog's `build-storybook` output. Currently dormant: the Visual Test workflow exists but its trigger is disabled and the Chromatic step is commented out ("add back during a cooldown").
_Avoid_: visual test (ambiguous with E2E screenshot assertions)
