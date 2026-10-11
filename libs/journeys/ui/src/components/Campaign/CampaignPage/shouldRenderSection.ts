import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { listedRegions } from '../CampaignRegionSwitcher'
import { hasText } from '../types'
import type { CampaignRegion, CampaignSectionTree } from '../types'

export interface SectionRenderContext {
  pageKind: CampaignPageKind
  region: CampaignRegion | null
  regions: CampaignRegion[]
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
 * on a Region Page (Share needs text until a language is linked); an Image
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
    case 'CampaignImageBlock':
      return hasText(section.src) || extras
    case 'CampaignHeaderBlock':
    case 'CampaignFooterBlock':
    default:
      return false
  }
}
