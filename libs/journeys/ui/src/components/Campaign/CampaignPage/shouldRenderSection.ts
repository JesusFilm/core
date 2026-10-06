import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { listedRegions } from '../CampaignRegionSwitcher'
import { splitParagraphs } from '../CampaignRichText'
import { hasText, isCampaignSection } from '../types'
import type {
  CampaignRegion,
  CampaignSectionTree,
  CampaignTree
} from '../types'

export interface SectionRenderContext {
  pageKind: CampaignPageKind
  region: CampaignRegion | null
  regions: CampaignRegion[]
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
 * or empty frames. Per type: Hero renders with any text, media or Extra; a
 * Region Switcher with no listed regions is skipped; a Video Carousel in
 * explicit mode with nothing renders its text if any, else is skipped; a
 * Journey List with no live-published journeys renders its text if any, else
 * is skipped; Analytics always renders; Region Header and Region Share render
 * on a Region Page (Share needs text until a language is linked); Rich Text
 * needs a title or a non-empty paragraph; Columns needs a Column Slot whose
 * section itself renders, or an Extra, so two empty slots skip the band.
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
        hasText(section.lede) ||
        section.media != null ||
        extras
      )
    case 'CampaignRegionSwitcherBlock':
      return listedRegions(context.regions).length > 0
    case 'CampaignVideoCarouselBlock':
      return (
        section.videoId != null ||
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        extras
      )
    case 'CampaignJourneyListBlock':
      return (
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        hasText(section.lede) ||
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
        (hasText(section.title) || hasText(section.intro) || extras)
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
    case 'CampaignHeaderBlock':
    case 'CampaignFooterBlock':
    default:
      return false
  }
}
