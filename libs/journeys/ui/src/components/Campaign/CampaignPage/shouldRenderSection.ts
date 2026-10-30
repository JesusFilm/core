import { slotSection } from '../CampaignRenderer/sectionRegistry'
import type { SectionRenderContext } from '../CampaignRenderer/sectionRegistry'
import type { CampaignSectionTree } from '../types'

export {
  shouldRenderSection,
  slotSection
} from '../CampaignRenderer/sectionRegistry'
export type { SectionRenderContext } from '../CampaignRenderer/sectionRegistry'

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
