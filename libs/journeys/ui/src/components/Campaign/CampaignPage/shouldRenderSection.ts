import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { featuredMediaBullets } from '../CampaignFeaturedMedia'
import { liveJourneyCards } from '../CampaignJourneyList'
import { hasCampaignMedia } from '../CampaignMediaSlot'
import { shareLanguages } from '../CampaignRegionShare'
import { listedRegions } from '../CampaignRegionSwitcher'
import { splitParagraphs } from '../CampaignRichText'
import { hasCarouselCards } from '../CampaignVideoCarousel'
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
 * or empty frames. Per type: Hero renders with any text, media or Extra;
 * Featured Media renders with any text, bullet, media or Extra (text alone
 * full width, media alone, both empty skipped); a Region Switcher with no
 * listed regions is skipped; a Video Carousel with no card (explicit mode
 * with no items, or a Watch video the gateway no longer serves) renders its
 * text if any, else is skipped — an expanded Video with no published
 * children is still its own card; a Journey List with no
 * live-published journeys renders its text if any, else is skipped;
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
      return listedRegions(context.regions).length > 0
    case 'CampaignVideoCarouselBlock':
      return (
        hasCarouselCards(section) ||
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        extras
      )
    case 'CampaignJourneyListBlock':
      return (
        liveJourneyCards(section).length > 0 ||
        hasText(section.eyebrow) ||
        hasText(section.title) ||
        hasText(section.description) ||
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
