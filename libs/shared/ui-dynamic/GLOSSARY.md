# Shared UI Dynamic (code-splitting façade)

A thin façade over the Shared UI kernel (`libs/shared/ui-dynamic`) whose modules exist to be loaded through `next/dynamic`: each re-exports one Shared UI component from its own entry point so consumers can lazy-load it as a named webpack chunk without dragging in the rest of the kernel. Owns no components and no vocabulary of its own.

## Language

**Dynamic Entry**:
A one-line module (today only `Dialog`) re-exporting a Shared UI component for consumption via `next/dynamic` + `webpackChunkName`. The component's meaning and behavior belong to the Shared UI kernel; this lib owns only the chunk boundary.
_Avoid_: dynamic component (the component isn't different — only how it's loaded)
