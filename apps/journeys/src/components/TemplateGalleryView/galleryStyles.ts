import { SxProps, Theme } from '@mui/material/styles'

/**
 * The object-only variant of `SxProps` (no callback, no array). Using this
 * for the token fields keeps each value both directly assignable to `sx`
 * and usable as an element when merged via the array form
 * (`sx={[baseObject, token]}`), which `SxProps` itself is not.
 */
type GalleryStyleSx = Exclude<
  SxProps<Theme>,
  readonly unknown[] | ((theme: Theme) => unknown)
>

/**
 * Prototype-only style presets for the public template gallery page.
 *
 * These presets explore different page *layouts* — how the header and the
 * template cards are arranged — in the tidy, professional spirit of a
 * product's single-page marketing site. The on-page `GalleryStyleToggle`
 * flips between them. This is exploratory scaffolding; none are committed
 * product styling yet.
 */

/**
 * Page-level arrangement of the gallery:
 * - `scroll`  — header on top, a horizontal scrolling row of cards
 * - `hero`    — the first template featured large, the rest in a row below
 * - `landing` — centered hero, then a tidy grid of elevated panel cards
 * - `bento`   — an asymmetric bento-box grid of image tiles
 * - `rows`     — alternating image/text feature rows (capped, then a grid)
 * - `sections` — a sectioned, animated landing page (intro / 2 featured /
 *   the rest), in the spirit of a product marketing site
 */
export type GalleryLayout =
  | 'scroll'
  | 'hero'
  | 'landing'
  | 'bento'
  | 'rows'
  | 'sections'

/**
 * How a grid card is drawn:
 * - `overlay` — image with the title overlaid (also used as a bento tile)
 * - `panel`   — an elevated surface: image, then captioned text and actions
 */
export type CardVariant = 'overlay' | 'panel'

/** How the collection header presents itself. */
export type HeaderVariant = 'default' | 'centered'

export interface GalleryStyle {
  id: string
  label: string
  /** One-line hint shown under the toggle so the layout is self-describing. */
  description: string
  /** Full-bleed page background, base text colour and font. */
  pageSx: GalleryStyleSx
  containerMaxWidth: 'sm' | 'md' | 'lg' | 'xl'
  titleVariant: 'h1' | 'h2' | 'h3' | 'h4'
  headerVariant: HeaderVariant
  layout: GalleryLayout
  cardVariant: CardVariant
  /** Accent colour for actions and the header eyebrow. */
  accent: string
  /** Corner radius (theme spacing units) for card images. */
  cardRadius: number
}

const ORIGINAL: GalleryStyle = {
  id: 'original',
  label: 'Showcase',
  description: 'Horizontal scrolling row of portrait cards',
  pageSx: { minHeight: '100dvh' },
  containerMaxWidth: 'lg',
  titleVariant: 'h2',
  headerVariant: 'default',
  layout: 'scroll',
  cardVariant: 'overlay',
  accent: '#26262E',
  cardRadius: 3
}

const SPOTLIGHT: GalleryStyle = {
  id: 'spotlight',
  label: 'Spotlight',
  description: 'First template featured large, the rest in a row below',
  pageSx: { minHeight: '100dvh' },
  containerMaxWidth: 'lg',
  titleVariant: 'h2',
  headerVariant: 'default',
  layout: 'hero',
  cardVariant: 'overlay',
  accent: '#C5283D',
  cardRadius: 3
}

const LANDING: GalleryStyle = {
  id: 'landing',
  label: 'Landing',
  description: 'Centered hero over a tidy grid of elevated cards',
  pageSx: { minHeight: '100dvh' },
  containerMaxWidth: 'lg',
  titleVariant: 'h2',
  headerVariant: 'centered',
  layout: 'landing',
  cardVariant: 'panel',
  accent: '#2563EB',
  cardRadius: 3
}

const BENTO: GalleryStyle = {
  id: 'bento',
  label: 'Bento',
  description: 'Asymmetric bento-box grid of image tiles',
  pageSx: { minHeight: '100dvh', backgroundColor: '#FAFAFA' },
  containerMaxWidth: 'lg',
  titleVariant: 'h3',
  headerVariant: 'default',
  layout: 'bento',
  cardVariant: 'overlay',
  accent: '#7C3AED',
  cardRadius: 2
}

const ROWS: GalleryStyle = {
  id: 'rows',
  label: 'Feature rows',
  description: 'Alternating image / text rows, generous whitespace',
  pageSx: { minHeight: '100dvh' },
  containerMaxWidth: 'lg',
  titleVariant: 'h2',
  headerVariant: 'centered',
  layout: 'rows',
  cardVariant: 'panel',
  accent: '#0F766E',
  cardRadius: 3
}

const SECTIONS: GalleryStyle = {
  id: 'sections',
  label: 'Sections',
  description: 'Sectioned, animated page: intro, 2 featured, then the rest',
  pageSx: { minHeight: '100dvh' },
  containerMaxWidth: 'lg',
  titleVariant: 'h2',
  headerVariant: 'centered',
  layout: 'sections',
  cardVariant: 'panel',
  // The journeys-admin brand red (journeysAdmin palette primary.main),
  // hard-coded so this preset keeps the admin accent regardless of theme.
  accent: '#C52D3A',
  cardRadius: 3
}

/** Index 0 is the live/original look; the rest are prototype explorations. */
export const galleryStyles: readonly GalleryStyle[] = [
  ORIGINAL,
  SPOTLIGHT,
  LANDING,
  BENTO,
  ROWS,
  SECTIONS
]
