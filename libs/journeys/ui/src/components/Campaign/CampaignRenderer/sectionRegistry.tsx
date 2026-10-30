import { ComponentType, ReactElement } from 'react'

import {
  CampaignPageKind,
  CampaignStringKey
} from '../../../../__generated__/globalTypes'
import { CampaignAnalytics } from '../CampaignAnalytics'
import { CampaignColumns } from '../CampaignColumns'
import {
  CampaignFeaturedMedia,
  featuredMediaBullets
} from '../CampaignFeaturedMedia'
import { CampaignHero } from '../CampaignHero'
import { CampaignImage } from '../CampaignImage'
import { CampaignJourneyList, liveJourneyCards } from '../CampaignJourneyList'
import { hasCampaignMedia } from '../CampaignMediaSlot'
import { campaignString, useCampaign } from '../CampaignProvider'
import { CampaignRegionHeader } from '../CampaignRegionHeader'
import { CampaignRegionShare, shareLanguages } from '../CampaignRegionShare'
import {
  CampaignRegionSwitcher,
  switcherRegions
} from '../CampaignRegionSwitcher'
import { CampaignRichText, splitParagraphs } from '../CampaignRichText'
import {
  CampaignVideoCarousel,
  hasCarouselCards
} from '../CampaignVideoCarousel'
import {
  type PageSectionTypename,
  REGION_ONLY_TYPENAMES
} from '../libs/campaignBlockGrammar'
import { hasText, isPageSection } from '../types'
import type {
  CampaignPublic,
  CampaignRegion,
  CampaignSectionTree,
  CampaignTree,
  CampaignTreeOf
} from '../types'

export interface SectionRenderContext {
  pageKind: CampaignPageKind
  region: CampaignRegion | null
  regions: CampaignRegion[]
  strings: CampaignPublic['strings']
}

/** A page section's renderer and its row of the public empty-state matrix. */
interface SectionEntry<T extends PageSectionTypename> {
  Component: ComponentType<{ block: CampaignTreeOf<T> }>
  /** Whether the section has anything to show; a region-only section off the Region Page is skipped before this is read. */
  hasContent: (
    section: CampaignTreeOf<T>,
    context: SectionRenderContext
  ) => boolean
}

type SectionRegistry = { [T in PageSectionTypename]: SectionEntry<T> }

function hasExtras(section: CampaignSectionTree): boolean {
  return section.children.some(
    (child) =>
      (child.__typename === 'CampaignTypographyBlock' &&
        hasText(child.content)) ||
      (child.__typename === 'CampaignButtonBlock' && hasText(child.label))
  )
}

function useSectionRenderContext(): SectionRenderContext {
  const { campaign, pageKind, region } = useCampaign()
  return {
    pageKind,
    region,
    regions: campaign.regions,
    strings: campaign.strings
  }
}

/** Columns with each Column Slot's section rendered through the registry, so `CampaignColumns` imports neither the renderer nor the render gates. */
function CampaignColumnsSection({
  block
}: {
  block: CampaignTreeOf<'CampaignColumnsBlock'>
}): ReactElement {
  const context = useSectionRenderContext()
  function renderSlot(slot: CampaignTree): ReactElement | null {
    const section = slotSection(slot, context)
    return section == null ? null : <CampaignPageSection block={section} />
  }
  return <CampaignColumns block={block} renderSlot={renderSlot} />
}

/**
 * One entry per page section: its component and its row of the public
 * empty-state matrix (PRD §11). A section with no body content and no Extras
 * is skipped, band and all, so visitors never see editor hints or empty
 * frames. Per type: Hero renders with any text, media or Extra; Featured
 * Media renders with any text, bullet, media or Extra (text alone full width,
 * media alone, both empty skipped); a Region Switcher with no region to show
 * and no Extra is skipped (on a Region Page the current region is not shown,
 * so one listed region there skips it); a Video Carousel with no card
 * (explicit mode with no items, or a Watch video the gateway no longer
 * serves) renders its eyebrow, title or description if any, else is skipped —
 * an expanded Video with no published children is still its own card; a
 * Journey List with no live-published journeys renders its text or the
 * campaign's `noJourneys` line if any, on every page kind, else is skipped;
 * Analytics always renders; Region Header renders for a region and Region
 * Share needs text, an Extra or a language with a live-published journey;
 * Rich Text needs a title or a non-empty paragraph; Columns needs a Column
 * Slot whose section itself renders, or an Extra, so two empty slots skip the
 * band; an Image section renders with a picture or an Extra, else is skipped.
 */
export const sectionRegistry = {
  CampaignHeroBlock: {
    Component: CampaignHero,
    hasContent: (section) =>
      hasText(section.eyebrow) ||
      hasText(section.title) ||
      hasText(section.description) ||
      hasCampaignMedia(section.media) ||
      hasExtras(section)
  },
  CampaignRegionSwitcherBlock: {
    Component: CampaignRegionSwitcher,
    hasContent: (section, context) =>
      switcherRegions(context.regions, context.region).length > 0 ||
      hasExtras(section)
  },
  CampaignVideoCarouselBlock: {
    Component: CampaignVideoCarousel,
    hasContent: (section) =>
      hasCarouselCards(section) ||
      hasText(section.eyebrow) ||
      hasText(section.title) ||
      hasText(section.description) ||
      hasExtras(section)
  },
  CampaignJourneyListBlock: {
    Component: CampaignJourneyList,
    hasContent: (section, context) =>
      liveJourneyCards(section).length > 0 ||
      hasText(section.eyebrow) ||
      hasText(section.title) ||
      hasText(section.description) ||
      hasText(campaignString(context.strings, CampaignStringKey.noJourneys)) ||
      hasExtras(section)
  },
  CampaignAnalyticsBlock: {
    Component: CampaignAnalytics,
    hasContent: () => true
  },
  CampaignRegionHeaderBlock: {
    Component: CampaignRegionHeader,
    hasContent: (_section, context) => context.region != null
  },
  CampaignRegionShareBlock: {
    Component: CampaignRegionShare,
    hasContent: (section, context) =>
      hasText(section.title) ||
      hasText(section.intro) ||
      hasExtras(section) ||
      (context.region != null && shareLanguages(context.region).length > 0)
  },
  CampaignRichTextBlock: {
    Component: CampaignRichText,
    hasContent: (section) =>
      hasText(section.title) ||
      splitParagraphs(section.richTextContent).length > 0 ||
      hasExtras(section)
  },
  CampaignColumnsBlock: {
    Component: CampaignColumnsSection,
    hasContent: (section, context) =>
      hasExtras(section) ||
      section.children.some((slot) => slotSection(slot, context) != null)
  },
  CampaignImageBlock: {
    Component: CampaignImage,
    hasContent: (section) => hasText(section.src) || hasExtras(section)
  },
  CampaignFeaturedMediaBlock: {
    Component: CampaignFeaturedMedia,
    hasContent: (section) =>
      hasText(section.eyebrow) ||
      hasText(section.title) ||
      hasText(section.description) ||
      featuredMediaBullets(section.bullets).length > 0 ||
      hasCampaignMedia(section.media) ||
      hasExtras(section)
  }
} satisfies SectionRegistry

function sectionEntry<T extends PageSectionTypename>(
  typename: T
): SectionEntry<T> {
  const registry: SectionRegistry = sectionRegistry
  return registry[typename]
}

/** A page section through its registry entry's component. */
export function CampaignPageSection({
  block
}: {
  block: CampaignTreeOf<PageSectionTypename>
}): ReactElement {
  const { Component } = sectionEntry(block.__typename)
  return <Component block={block} />
}

function isRegionOnly(typename: PageSectionTypename): boolean {
  return (REGION_ONLY_TYPENAMES as readonly string[]).includes(typename)
}

/**
 * Whether a section renders on the public page: a page section (never the
 * chrome, which renders through the page's chrome slots), on the Region Page
 * if it is region-only, whose registry entry has content.
 */
export function shouldRenderSection(
  section: CampaignSectionTree,
  context: SectionRenderContext
): boolean {
  if (!isPageSection(section)) return false
  if (
    isRegionOnly(section.__typename) &&
    context.pageKind !== CampaignPageKind.regionTemplate
  )
    return false
  return sectionEntry(section.__typename).hasContent(section, context)
}

/**
 * The section a Column Slot holds when it renders: the slot's one child, if it
 * is a section that passes the empty-state matrix. Anything else leaves the
 * slot empty.
 */
export function slotSection(
  slot: CampaignTree,
  context: SectionRenderContext
): CampaignTreeOf<PageSectionTypename> | null {
  const child = slot.children[0]
  if (child == null || !isPageSection(child)) return null
  return shouldRenderSection(child, context) ? child : null
}
