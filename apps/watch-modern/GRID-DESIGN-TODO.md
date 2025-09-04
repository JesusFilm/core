# Watch Grid Redesign – Implementation TODOs

Goal: Recreate the visual design and behavior of https://www.jesusfilm.org/watch in the /watch-modern app using shadcn/ui + Tailwind. Focus on the home grid (cards, overlays, labels, responsive spans, hover, and loading states). Keep data plumbing unchanged where possible.

---

## Acceptance Criteria

- Grid tiles visually match legacy /watch: large 16:9 tiles with bottom-left text overlay, colored uppercase type label, right-aligned count/duration pill, subtle hover scale+shadow, and rounded corners.
- Responsive 12‑column grid with mixed spans: some “featured/wide” tiles (2x width), the rest standard. No layout shift on hover.
- Works with Next/Image, supports remote images currently used by the app.
- Accessible: whole card is a link, visible focus ring, meaningful aria labels.
- Fast feel: skeleton placeholders while loading; graceful fallback when image missing.

---

## High‑Level Plan

1) Add shadcn/ui primitives and Tailwind tokens we need.
2) Introduce a reusable `MediaCard` component (overlay + labels + duration).
3) Add a 12‑column responsive grid with optional featured spans.
4) Wire `VideoGrid.tsx` to use `MediaCard` and new spans; keep data mapping intact.
5) Gate behind feature flag; provide skeletons and accessibility. (COMPLETED - Flag removed, always enabled)
6) Update Next config for remote images if required; add light E2E checks.

---

## Step‑by‑Step Tasks

### 0) Prep

- [ ] Confirm local dev runs at `http://0.0.0.0:4800/watch`.
- [ ] Ensure Tailwind is active in this app. If not, stop and fix first.

### 1) Install shadcn/ui (or add needed components)

Preferred (generator):

```
npx shadcn-ui@latest init
npx shadcn-ui@latest add card badge aspect-ratio tooltip skeleton
```

If generator is not desired, copy minimal components into `apps/watch-modern/src/components/ui/`:

- `card.tsx` (wrapper with `Card`, `CardContent`)
- `badge.tsx`
- `aspect-ratio.tsx`
- `skeleton.tsx`

These should follow the standard shadcn patterns and accept `className` props.

### 2) Tailwind tokens/utilities

- [ ] Add a subtle elevation and ring palette to Tailwind theme (optional if already present). In `tailwind.config` or `globals.css` add utilities used below; ensure dark mode classes are consistent with the app.
- [ ] Confirm container and breakpoints align with current app.

Type label color mapping (use text colors, not backgrounds):

- `feature-film` → `text-amber-400`
- `chapter` → `text-indigo-400`
- `series` → `text-green-400`
- `collection` → `text-orange-400`
- `episode` → `text-sky-400`

Gradient overlay utility (use inline arbitrary value):

```
bg-[linear-gradient(to_top,rgba(0,0,0,0.78),rgba(0,0,0,0.0)_58%)]
```

### 3) Next/Image remote domains

- [ ] Open `apps/watch-modern/next.config.mjs` and confirm image `remotePatterns` or `domains` include sources used by thumbnails; add if missing.

### 4) Create reusable MediaCard

Create `apps/watch-modern/src/components/watch/home/MediaCard.tsx` with:

```
export type MediaKind = 'feature-film' | 'chapter' | 'series' | 'collection' | 'episode';

export type MediaCardProps = {
  id: string;
  href: string;
  title: string;
  kind: MediaKind;
  countLabel?: string;        // e.g., "61 chapters", "7 episodes", "80 items"
  durationSeconds?: number;   // if present shows time pill with play icon
  imageUrl?: string;
  featured?: boolean;         // if true spans 2x width on larger screens
  className?: string;
};
```

Behavior/structure:

- Wrapper: a single `<Link>` covering the card, `group` class, `aria-label` = title.
- Rounded tile using `Card` with `rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-white/20 transition` and `shadow-[0_6px_24px_rgba(0,0,0,0.35)]` on hover.
- Aspect: `AspectRatio ratio={16/9}` with `Next/Image` as background (cover).
- Bottom overlay: absolutely positioned gradient div using the gradient above.
- Text block: bottom-left, includes:
  - Type label (uppercase, tracking-wide, semibold, mapped color class).
  - Title (text-white, font-semibold, responsive sizes, 2-line clamp).
- Right-bottom pill:
  - If `durationSeconds` present → show play icon + `mm:ss`/`h:mm:ss` via helper.
  - Else if `countLabel` present → show that.
  - Style: `rounded-md bg-black/55 text-white text-xs font-medium px-2 py-0.5 backdrop-blur-[2px]`.
- Hover: `group-hover:scale-[1.01]` on image wrapper, subtle translate-y on text if desired (keep layout stable).
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400` on the link.
- Missing image: fallback div with neutral bg and an overlay icon + title.

Helpers:

- `formatDuration(seconds: number): string` in a tiny util.
- `kindToColor(kind): string` returning one of the text color classes above.

### 5) Responsive Grid with featured spans

Edit `apps/watch-modern/src/components/watch/home/VideoGrid.tsx`:

- [ ] Behind feature flag (see step 7), render a 12‑column CSS grid:

```
<div className="grid grid-cols-12 gap-4 md:gap-5 lg:gap-6">
  {items.map((it, i) => (
    <div key={it.id}
         className={cn(
           it.featured ? 'col-span-12 md:col-span-8 lg:col-span-6' : 'col-span-12 sm:col-span-6 lg:col-span-4'
         )}>
      <MediaCard {...mappedProps} />
    </div>
  ))}
</div>
```

- [ ] Choose featured items: use existing backend flag if available; otherwise, for parity, feature the first `N` items (e.g., 3) on large screens. Keep deterministic.

### 6) Map data into MediaCard

In `VideoGrid.tsx`, map existing item shape to `MediaCardProps`:

- `title` → item title.
- `kind` → derive from item type (e.g., feature film, series, chapter, collection, episode).
- `countLabel` → if collection/series/feature film with chapters/episodes/items, format `"{n} chapters"/"{n} episodes"/"{n} items"`.
- `durationSeconds` → if a playable single video or chapter provides `duration`.
- `imageUrl` → preferred poster/thumbnail from existing fields.
- `href` → existing routing link.



### 8) Skeleton loading

- [ ] When data is loading, render a fixed set of skeleton tiles to avoid layout shift:

```
<div className="grid grid-cols-12 gap-4 md:gap-5 lg:gap-6">
  {Array.from({ length: 12 }).map((_, i) => (
    <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4">
      <Card className="rounded-xl overflow-hidden">
        <AspectRatio ratio={16/9}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </Card>
    </div>
  ))}
</div>
```

### 9) Accessibility

- [ ] Entire card clickable via `<Link>`; no nested interactive elements.
- [ ] `aria-label` includes title, e.g., `aria-label={`${title} – open details`}`.
- [ ] Focus ring visible and meets contrast.
- [ ] Text remains readable at 200% zoom; overlay provides sufficient contrast.

### 10) Page integration polish

- [ ] Review `WatchHomePage.tsx` paddings to match legacy horizontal gutter. Suggested container: `px-4 sm:px-6 lg:px-8` with outer `max-w-[1400px] mx-auto`.
- [ ] Ensure `HomeHero.tsx` coexists; grid starts below hero with consistent spacing.

### 11) Tests (lightweight)

- [ ] Update/extend `apps/watch-modern-e2e/src/e2e/search/grid-layout.spec.ts` to assert:
  - New grid renders when flag is on.
  - A tile has the type label uppercase with expected color class.
  - A tile with duration shows a play icon and formatted time.
  - Featured tiles occupy larger span (can check by bounding box width difference).

### 12) Cleanup

- [ ] Retain old grid code path temporarily; mark with TODO to remove once launched.
- [ ] Remove any legacy borders/shadows from previous card CSS when flag is on.

### 13) QA checklist

- [ ] Compare spacing, radii, shadows, and label colors against https://www.jesusfilm.org/watch at common breakpoints (375, 768, 1024, 1280, 1440).
- [ ] Verify long titles wrap cleanly (2‑line clamp) without pushing pills off-screen.
- [ ] Confirm images are not stretched; all tiles maintain 16:9.
- [ ] Ensure hover on desktop adds shadow/scale but does not shift layout.
- [ ] Test keyboard navigation order and focus ring.
- [ ] Confirm slow network shows skeletons and no CLS.


---

## Code Sketches (for reference)

MediaCard rough JSX (summarized):

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

export function MediaCard({ title, kind, countLabel, durationSeconds, imageUrl, href }: MediaCardProps) {
  const typeClass = kindToColor(kind)
  return (
    <Link href={href} aria-label={`${title} – open details`} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl block">
      <Card className="rounded-xl overflow-hidden ring-1 ring-white/10 transition duration-200 hover:ring-white/20">
        <div className="relative">
          <AspectRatio ratio={16/9}>
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill priority={false} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
            ) : (
              <div className="h-full w-full bg-neutral-800" />
            )}
          </AspectRatio>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.78),rgba(0,0,0,0)_58%)]" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className={cn('text-xs font-semibold uppercase tracking-wide', typeClass)}>
                  {labelFromKind(kind)}
                </div>
                <div className="text-white font-semibold text-lg sm:text-xl leading-tight line-clamp-2">{title}</div>
              </div>
              <div className="shrink-0 rounded-md bg-black/55 text-white text-xs font-medium px-2 py-0.5 backdrop-blur-[2px]">
                {durationSeconds ? formatDuration(durationSeconds) : countLabel}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
```

Grid spans example:

```tsx
<div className="grid grid-cols-12 gap-4 md:gap-5 lg:gap-6">
  {items.map((it, i) => (
    <div key={it.id} className={it.featured ? 'col-span-12 md:col-span-8 lg:col-span-6' : 'col-span-12 sm:col-span-6 lg:col-span-4'}>
      <MediaCard {...mapItem(it)} />
    </div>
  ))}
  {/* keep total columns filled; avoid empty space when featured logic changes */}
</div>
```

---

## Notes

- Keep styles minimal and utility‑first. Avoid custom CSS files unless necessary.
- Reuse existing `cn` utility if present (`@/lib/utils`).
- Do not change routing or data structures unless required for labels/durations.
- If legacy uses different label vocabulary, implement mapping in a single helper.

---

## Context Files (read before implementation)

These files define routing, providers, current grid behavior, styling tokens, and tests that the redesign must respect. Open each path for quick orientation.

- Pages and routing
  - `apps/watch-modern/src/app/page.tsx:1` – App entry; wraps `WatchHomePage` with Apollo + InstantSearch providers.
  - `apps/watch-modern/src/components/watch/home/WatchHomePage.tsx:1` – Composes `HomeHero` + `VideoGrid` + `AboutSection`.
  - `apps/watch-modern/src/components/watch/home/HomeHero.tsx:1` – Hero section above the grid to align spacing.

- Search/grid components
  - `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:1` – Current InstantSearch widgets, hit mapping, skeletons.
  - `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:202` – `export function VideoGrid()` render root to replace behind flag.
  - `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:54` – `transformAlgoliaVideo` maps Algolia fields → UI props (duration/type/count).

- Providers
  - `apps/watch-modern/src/components/providers/instantsearch.tsx:1` – InstantSearch provider, pulls `NEXT_PUBLIC_ALGOLIA_*` envs.

- UI primitives used by grid
  - `apps/watch-modern/src/components/ui/card.tsx:1` – `Card`, `CardHeader`, `CardContent` used for tiles/skeletons.
  - `apps/watch-modern/src/components/ui/skeleton.tsx:1` – Skeleton block component.
  - `apps/watch-modern/src/components/ui/container.tsx:8` – Page container with `max-w-7xl px-4 md:px-6`.
  - `apps/watch-modern/src/lib/utils.ts:4` – `cn` class join utility.

- Styling and Tailwind
  - `apps/watch-modern/src/app/globals.css:1` – CSS variables for colors; dark background; body defaults.
  - `apps/watch-modern/tailwind.config.js:1` – Tailwind theme extension and content globs.

- Next config (important for images and basePath)
  - `apps/watch-modern/next.config.mjs:1` – `basePath: '/watch'`, `assetPrefix`, `images.remotePatterns` (remote thumbnails must be allowed).

- Environment variables (do not commit values)
  - `apps/watch-modern/.env:1` – Local envs including `NEXT_PUBLIC_ALGOLIA_*`.

- E2E and integration tests influencing layout
  - `apps/watch-modern-e2e/src/e2e/search/grid-layout.spec.ts:1` – Asserts responsive grid classes and result counts; update when switching to 12‑col layout.
  - `apps/watch-modern-e2e/src/e2e/search/search.spec.ts:1` – Search interactions to keep working.
  - `apps/watch-modern-e2e/src/e2e/page/watch.spec.ts:1` – Basic page assertions for `/watch`.
  - `apps/watch-modern/src/app/watch/__tests__/watch.integration.spec.tsx:1` – Provider mounting + basic UI presence.

- Assets
  - `apps/watch-modern/public/watch/hero.jpg:1` – Hero image used by `HomeHero`; ensure new grid spacing does not overlap hero.

Notes for the agent

- Respect `basePath: '/watch'` when constructing links inside `MediaCard`.
- If adding `next/image`, confirm `imageUrl` domains exist in `next.config.mjs` `remotePatterns`.
- Keep InstantSearch hooks intact; the redesign only changes the render of hits and grid layout, not the search behavior.
