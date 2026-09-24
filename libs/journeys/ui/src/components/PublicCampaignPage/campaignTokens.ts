import { brandRed } from '@core/shared/ui/themes/base/tokens/colors'

import type {
  PublicGalleryPageItem,
  PublicGalleryPageMedia
} from '../PublicGalleryPage/galleryTokens'

/**
 * Shared visual tokens, view-model types and URL builders for the public
 * campaign page. Leaf module (imports nothing from the component tree) so
 * the entry component and every section import from here without cycles —
 * same pattern as `PublicGalleryPage/galleryTokens.ts`.
 */

export const CAMPAIGN_ACCENT = brandRed
/** Near-black page background; the page paints it itself so it reads the same under any host theme. */
export const CAMPAIGN_BG = '#0B0A0F'
export const CAMPAIGN_SURFACE = 'rgba(255,255,255,0.05)'
export const CAMPAIGN_BORDER = 'rgba(255,255,255,0.12)'
export const CAMPAIGN_TEXT = '#FFFFFF'
export const CAMPAIGN_TEXT_MUTED = 'rgba(255,255,255,0.72)'
/** Rows shown in the country-views list. */
export const COUNTRY_VIEWS_LIMIT = 10
/** Section ids the header CTA scrolls to. */
export const CAMPAIGN_SECTION_IDS = {
  share: 'campaign-share',
  media: 'campaign-media',
  templates: 'campaign-templates',
  countries: 'campaign-countries'
} as const

export interface PublicCampaignShareJourney {
  id: string
  slug: string
  title: string
  language: {
    id: string
    bcp47?: string | null
    /** Language name entries: the primary (native) name plus an English name. */
    name: ReadonlyArray<{ value: string; primary: boolean }>
  }
}

export interface PublicCampaignCountry {
  countryCode: string
  countryName?: string | null
  visitors: number
}

export interface PublicCampaignCountryStats {
  totalVisitors: number
  countries: ReadonlyArray<PublicCampaignCountry>
}

/**
 * Neutral view-model for the public campaign page, shared by the live page
 * (`apps/journeys`) and the admin builder preview (`apps/journeys-admin`).
 * Each app maps its own generated GraphQL types into this shape.
 */
export interface PublicCampaignPageData {
  title: string
  eyebrow?: string | null
  tagline?: string | null
  description: string
  backgroundImageSrc?: string | null
  backgroundImageAlt?: string | null
  /** Optional hero media; null/omitted hides the media section. */
  media?: PublicGalleryPageMedia | null
  /** Journeys offered by the language share panel, in display order. */
  shareJourneys: ReadonlyArray<PublicCampaignShareJourney>
  /** Template journeys shown in the customizable collection, in display order. */
  templates: ReadonlyArray<PublicGalleryPageItem>
  /** Country view counts; null renders an "unavailable" state, omitted hides the section. */
  countryStats?: PublicCampaignCountryStats | null
  /** Origin of the public journeys viewer, e.g. `https://your.nextstep.is`. */
  publicOrigin: string
}

function trimOrigin(origin: string): string {
  return origin.replace(/\/+$/, '')
}

/** Public viewer link for a share journey. */
export function buildShareUrl(publicOrigin: string, slug: string): string {
  return `${trimOrigin(publicOrigin)}/${slug}`
}

/** Embedded (chromeless) viewer link used by the interactive preview frame. */
export function buildEmbedUrl(publicOrigin: string, slug: string): string {
  return `${trimOrigin(publicOrigin)}/embed/${slug}?expand=false`
}

/**
 * Human label for the language picker: the English name with the native name
 * in brackets when they differ (e.g. "Spanish (Español)"), falling back to the
 * journey title when the language carries no names.
 */
export function shareJourneyLanguageLabel(
  journey: PublicCampaignShareJourney
): string {
  const names = journey.language.name
  const english = names.find(({ primary }) => !primary)?.value
  const native = names.find(({ primary }) => primary)?.value
  if (english != null && native != null && english !== native) {
    return `${english} (${native})`
  }
  return english ?? native ?? journey.title
}

export function formatViews(value: number): string {
  return new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(value)
}
