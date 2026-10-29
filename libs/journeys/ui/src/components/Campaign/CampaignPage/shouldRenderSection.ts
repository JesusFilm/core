import {
  CampaignPageKind,
  CampaignStringKey
} from '../../../../__generated__/globalTypes'
import { featuredMediaBullets } from '../CampaignFeaturedMedia'
import { liveJourneyCards } from '../CampaignJourneyList'
import { hasCampaignMedia } from '../CampaignMediaSlot'
import { campaignString } from '../CampaignProvider'
import { shareLanguages } from '../CampaignRegionShare'
import { switcherRegions } from '../CampaignRegionSwitcher'
import { splitParagraphs } from '../CampaignRichText'
import { hasCarouselCards } from '../CampaignVideoCarousel'
import { hasText, isCampaignSection } from '../types'
import type {
  CampaignPublic,
  CampaignRegion,
  CampaignSectionTree,
  CampaignTree
} from '../types'

export interface SectionRenderContext {
  pageKind: CampaignPageKind
  region: CampaignRegion | null
  regions: CampaignRegion[]
  strings: CampaignPublic['strings']
}

/**
 * The section a Column Slot holds when it renders: the slot's one child, if it
 * is a section that passes the empty-state matrix. Anything else leaves the
 * slot empty.
 */
export function slotSection(
  slot: CampaignTree,
  context: SectionRenderContext
): CampaignSectionTree | null {
  const child = slot.children[0]
  if (child == null || !isCampaignSection(child)) return null
  return shouldRenderSection(child, context) ? child : null
}

function hasExtras(section: CampaignSectionTree): boolean {
  return section.children.some(
    (child) =>
      (child.__typename === 'CampaignTypographyBlock' &&
        hasText(child.content)) ||
      (child.__typename === 'CampaignButtonBlock' && hasText(child.label))
  )
}

/**
 * The public empty-state matrix (PRD §11): a section with no body content
 * and no Extras is skipped, band and all, so visitors never see editor hints
 * or empty frames. Per type: Hero renders with any text, media or Extra;
 * Featured Media renders with any text, bullet, media or Extra (text alone
 * full width, media alone, both empty skipped); a Region Switcher with no
 * region to show and no Extra is skipped (on a Region Page the current
 * region is not shown, so one listed region there skips it); a Video Carousel with no card (explicit mode
 * with no items, or a Watch video the gateway no longer serves) renders its
 * eyebrow, title or description if any, else is skipped — an expanded Video
 * with no published children is still its own card; a Journey List with no
 * live-published journeys renders its text or the campaign's `noJourneys`
 * line if any, on every page kind, else is skipped;
 * Analytics always renders; Region Header and Region Share render on a
 * Region Page (Share needs text, an Extra or a language with a live-published journey); Rich Text needs
 * a title or a non-empty paragraph; Columns needs a Column Slot whose section
 * itself renders, or an Extra, so two empty slots skip the band; an Image
 * section renders with a picture or an Extra, else is skipped.
 */
export function shouldRenderSection(
  section: CampaignSectionTree,
  context: SectionRenderContext
): boolean {
  const extras = hasExtras(section)
  switch (section.__typename) {
    case 'CampaignHeroBlock':
      return (
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        hasText(section.description) ||
        hasCampaignMedia(section.media) ||
        extras
      )
    case 'CampaignFeaturedMediaBlock':
      return (
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        hasText(section.description) ||
        featuredMediaBullets(section.bullets).length > 0 ||
        hasCampaignMedia(section.media) ||
        extras
      )
    case 'CampaignRegionSwitcherBlock':
      return (
        switcherRegions(context.regions, context.region).length > 0 || extras
      )
    case 'CampaignVideoCarouselBlock':
      return (
        hasCarouselCards(section) ||
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        hasText(section.description) ||
        extras
      )
    case 'CampaignJourneyListBlock':
      return (
        liveJourneyCards(section).length > 0 ||
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        hasText(section.description) ||
        hasText(
          campaignString(context.strings, CampaignStringKey.noJourneys)
        ) ||
        extras
      )
    case 'CampaignAnalyticsBlock':
      return true
    case 'CampaignRegionHeaderBlock':
      return (
        context.pageKind === CampaignPageKind.regionTemplate &&
        context.region != null
      )
    case 'CampaignRegionShareBlock':
      return (
        context.pageKind === CampaignPageKind.regionTemplate &&
        (hasText(section.title) ||
          hasText(section.intro) ||
          extras ||
          (context.region != null && shareLanguages(context.region).length > 0))
      )
    case 'CampaignRichTextBlock':
      return (
        hasText(section.title) ||
        splitParagraphs(section.richTextContent).length > 0 ||
        extras
      )
    case 'CampaignColumnsBlock':
      return (
        extras ||
        section.children.some((slot) => slotSection(slot, context) != null)
      )
    case 'CampaignImageBlock':
      return hasText(section.src) || extras
    case 'CampaignHeaderBlock':
    case 'CampaignFooterBlock':
    default:
      return false
  }
}

/**
 * The ids of the sections a page renders, given its top-level sections that
 * pass `shouldRenderSection`: each of them, and the section of every Column
 * Slot that renders one. These are the anchors a same-page scroll can reach;
 * a target outside the set renders its button inert.
 */
export function renderedSectionIds(
  sections: CampaignSectionTree[],
  context: SectionRenderContext
): Set<string> {
  const ids = new Set<string>()
  function add(section: CampaignSectionTree): void {
    ids.add(section.id)
    if (section.__typename !== 'CampaignColumnsBlock') return
    for (const slot of section.children) {
      const child = slotSection(slot, context)
      if (child != null) add(child)
    }
  }
  sections.forEach(add)
  return ids
}
