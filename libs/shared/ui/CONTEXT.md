# Shared UI (design-system kernel)

The shared client-side design vocabulary (`libs/shared/ui`): the MUI Theme catalog, the house Icon Set, Feature Flags plumbing, and cross-app UI components (Dialog, LanguageAutocomplete, NextImage...). Owns no product entities; the visual kernel consumed by every Next.js surface and the shared journeys kernel.

## Language

**Theme**:
A named MUI theme from the catalog, addressed by `ThemeName` × `ThemeMode` (light/dark) via `getTheme`. Four names: `base` (the foundation), `journeyUi` (rendered journey cards), `journeysAdmin` (the admin chrome — light only; dark falls back to light with a warning), and `website` (the jesusfilm.org-styled surfaces). Themes also carry RTL, locale, and font-family variation.
_Avoid_: skin, style preset

**Icon Set**:
The ~244 house SVG icons under `icons/`, each an MUI `SvgIcon` imported individually by name (`icons/ChevronDown`), plus the name-keyed `Icon` dispatcher for icon-by-data use (e.g. journey blocks choosing an icon by enum).
_Avoid_: MUI icons (`@mui/icons-material` is a restricted import — this set replaces it)

**Feature Flag**:
A boolean toggle read via `useFlags` from the `FlagsProvider` context. The provider is dumb — flags are resolved upstream (LaunchDarkly server-side via `getLaunchDarklyClient`) and injected per page; absence of a flag reads as `false`-ish (empty object).
_Avoid_: experiment, toggle config

**Storybook Config Kit**:
The shared story-configuration helpers (`libs/storybook`, imported as `@core/shared/ui/storybook` — the single most-imported module) that give every project's stories consistent decorators and theme wrapping.
