/**
 * The curated Google Fonts the journeys Theme Builder offers, shared with the
 * campaign Theme panel and the API's font-name rule (campaign PRD §4): a
 * supplied `headerFont` / `bodyFont` / `labelFont` must be one of these.
 */
export enum FontFamily {
  Montserrat = 'Montserrat',
  Inter = 'Inter',
  Oswald = 'Oswald',
  PlayfairDisplay = 'Playfair Display',
  CormorantGaramond = 'Cormorant Garamond',
  NotoSans = 'Noto Sans',
  BerkshireSwash = 'Berkshire Swash',
  Cinzel = 'Cinzel',
  Baloo = 'Baloo 2',
  Nunito = 'Nunito',
  Raleway = 'Raleway',
  Gelasio = 'Gelasio'
}

/** Every curated font name, whatever its role. */
export const FONT_FAMILIES: readonly string[] = Object.values(FontFamily)

export const HEADER_FONT_OPTIONS: readonly FontFamily[] = [
  FontFamily.Montserrat,
  FontFamily.Inter,
  FontFamily.Oswald,
  FontFamily.PlayfairDisplay,
  FontFamily.Gelasio,
  FontFamily.CormorantGaramond,
  FontFamily.NotoSans,
  FontFamily.BerkshireSwash,
  FontFamily.Cinzel,
  FontFamily.Baloo
]

export const BODY_FONT_OPTIONS: readonly FontFamily[] = [
  FontFamily.Montserrat,
  FontFamily.Inter,
  FontFamily.Nunito,
  FontFamily.Raleway,
  FontFamily.NotoSans,
  FontFamily.Gelasio,
  FontFamily.CormorantGaramond
]

export const LABELS_FONT_OPTIONS: readonly FontFamily[] = [
  FontFamily.Montserrat,
  FontFamily.Inter,
  FontFamily.NotoSans,
  FontFamily.Nunito,
  FontFamily.Raleway,
  FontFamily.Gelasio,
  FontFamily.Baloo
]
