# short-links-admin

## UI stack: Coss UI, not MUI

This app uses [Coss UI](https://coss.com/ui) (Base UI primitives styled with Tailwind v4, installed through the shadcn CLI). It does **not** use Material UI, Emotion or a snackbar library, which overrides the "MUI over raw HTML" rule in `apps/AGENTS.md` for this app only.

- Primitives live in `src/components/ui/*` and are **owned code**: edit them there when a variant or behaviour is missing. They import Base UI (`@base-ui/react/*`), `cn()` from `src/lib/utils.ts`, `class-variance-authority` and `lucide-react`.
- Style with Tailwind utilities and `cn()`. No `styled()`, no CSS-in-JS, no inline style objects except for values that come from data (bar heights, banner offsets).
- Tokens (`--background`, `--primary`, `--info`, `--success`, `--warning`, `--destructive-foreground`, radii, fonts) are defined in `src/app/globals.css`, which `src/app/layout.tsx` imports. Fonts are `next/font` variables named `--font-sans` and `--font-mono`; `--font-heading` falls back to `--font-sans`. Dark mode is the `class` variant driven by `next-themes` (system preference).
- Form fields: use `src/components/form` (`TextField`, `TextareaField`, `SelectField`, `SwitchField`) which compose Coss `Field`/`FieldLabel`/`FieldError` so labels, errors and helper text are consistent and accessible. Multi-select uses Coss `Combobox` with chips. Formik still owns form state.
- Feedback: `notify()` / `notifyError()` from `src/libs/toast` (wraps `toastManager`); `ConfirmDialog` wraps `AlertDialog`; status chips are `Badge`s.
- Tables are the presentational Coss `Table`; selection and cursor pagination are hand-rolled in `LinkList` (no TanStack Table).

### Adding a component

```bash
cd apps/short-links-admin
pnpm dlx shadcn@latest add @coss/<name>
```

`components.json` points the `@coss` registry at `https://coss.com/ui/r/{name}.json` and the aliases at `@/components/ui`, `@/lib/utils`. Two traps:

1. The CLI resolves `@/` through the nearest tsconfig `paths` and has been seen writing into the **repo root** `src/` instead of the app. Check `git status` after every add and move stray files into `apps/short-links-admin/src/`.
2. The CLI installs dependencies with the nearest `package.json`. There must never be a `package.json` inside this app: if the CLI needs one to run, create a throwaway one, run the add, delete it together with any nested `node_modules`, and add whatever packages the registry item lists to the **root** with `pnpm add -w <pkg>` (or `pnpm add -w -D` for dev deps). Today the only Coss runtime dependency beyond what the root already had is `@base-ui/react`.

Prefer adding only the components you use; delete unused ones rather than leaving them in `src/components/ui`.

### Testing notes (jsdom)

`setupTests.tsx` polyfills what Base UI popups need to mount and open under jsdom: `ResizeObserver`, `window.matchMedia`, `Element.prototype.scrollIntoView`, `PointerEvent`, `hasPointerCapture`/`setPointerCapture`/`releasePointerCapture`, and `Element.prototype.getAnimations` (Base UI waits for exit animations). The polyfills are guarded so specs that opt into `// @vitest-environment node` still load the setup file.

Query the new components by role: Select triggers are `combobox`es named by their `FieldLabel`, options are `option`s, `Switch` is a `switch`, `Checkbox` a `checkbox`, dialogs are `dialog`s. `vitest.config.mts` sets `css: false` and aliases `@/` to `src/`.
