import { slotSection } from '../CampaignRenderer/sectionRegistry'
import type { SectionRenderContext } from '../CampaignRenderer/sectionRegistry'
import type { CampaignSectionTree } from '../types'

export {
  shouldRenderSection,
  slotSection
} from '../CampaignRenderer/sectionRegistry'
export type { SectionRenderContext } from '../CampaignRenderer/sectionRegistry'

/**
 * The sections a page renders, in render order, given its top-level sections
 * that pass `shouldRenderSection`: each of them, with the section of every
 * Column Slot that renders one in its Columns' place.
 */
function renderedSections(
  sections: CampaignSectionTree[],
  context: SectionRenderContext
): CampaignSectionTree[] {
  const rendered: CampaignSectionTree[] = []
  function add(section: CampaignSectionTree): void {
    rendered.push(section)
    if (section.__typename !== 'CampaignColumnsBlock') return
    for (const slot of section.children) {
      const child = slotSection(slot, context)
      if (child != null) add(child)
    }
  }
  sections.forEach(add)
  return rendered
}

/**
 * The ids of the sections a page renders (`renderedSections`). These are the
 * anchors a same-page scroll can reach; a target outside the set renders its
 * button inert.
 */
export function renderedSectionIds(
  sections: CampaignSectionTree[],
  context: SectionRenderContext
): Set<string> {
  return new Set(
    renderedSections(sections, context).map((section) => section.id)
  )
}

/**
 * The block whose heading is the page's one `h1`: the Region Header whenever
 * one renders (its region name), else the first rendered Hero (its title).
 * Null when neither renders.
 */
export function pageHeadingBlockId(
  sections: CampaignSectionTree[],
  context: SectionRenderContext
): string | null {
  const rendered = renderedSections(sections, context)
  const owner =
    rendered.find(
      (section) => section.__typename === 'CampaignRegionHeaderBlock'
    ) ?? rendered.find((section) => section.__typename === 'CampaignHeroBlock')
  return owner?.id ?? null
}
