# Shared UI Modern (Tailwind design kernel)

The Tailwind-era sibling of the Shared UI kernel (`libs/shared/ui-modern`): a vendored shadcn/ui component kit (Button, Dialog, Command, Select…) plus the `cn` class-merging helper and the CSS-variable design tokens they style against. Owns no product entities; consumed today only by Watch (legacy), which is migrating surfaces from MUI to Tailwind.

## Language

**Vendored Component**:
A shadcn/ui component whose source is copied into `src/components/` and owned by this repo — not an npm dependency. Styled with Tailwind classes over Radix primitives, variants expressed via `cva`. Generated in the "new-york" style with lucide as the icon library.
_Avoid_: shadcn dependency, ui package component

**Add Script**:
`add-shadcn-component.sh` — the sanctioned way to vendor a new component. It installs the Radix/utility dependencies at the monorepo root (never in this lib's own package.json) and registers the export. Manually running `npx shadcn add` risks stray local dependencies.
_Avoid_: shadcn CLI (directly), manual add

**Design Tokens**:
The HSL CSS variables in `src/styles/globals.css` (`--background`, `--primary`, `--destructive`, `--radius`…) that all Vendored Components reference. Dark mode is the `.dark` class swapping the same variable set; the base palette is shadcn's "zinc".
_Avoid_: theme (that word belongs to the MUI Theme catalog in Shared UI)

**Extended Component**:
A house variant layer over a Vendored Component (today only `ExtendedButton`), re-declaring the `cva` variants so local customization survives regeneration of the underlying Vendored Component.
_Avoid_: custom component, override

**`cn`**:
The class-merging helper (`clsx` + `tailwind-merge`) every Tailwind surface uses to compose and override component classes. Exported from `@core/shared/ui-modern/utils`.
_Avoid_: classNames, clsx (directly)
