import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignChildPlacement,
  CampaignPageKind
} from '../../../../../__generated__/globalTypes'
import { CampaignSectionTypename } from '../../../../libs/useCampaignSectionCreateMutation'
import type {
  CampaignAddPreset,
  CampaignSelection
} from '../../CampaignEditorProvider'
import {
  pageSections,
  sectionTypesForPage,
  sectionTypesForSlot
} from '../../sectionTypes'
import type { SectionInsert } from '../useAddSection'

export type ExtraTypename = 'CampaignTypographyBlock' | 'CampaignButtonBlock'

const EXTRA_TYPENAMES: readonly ExtraTypename[] = [
  'CampaignTypographyBlock',
  'CampaignButtonBlock'
]

/** The Extra types a host renders: the header shows only its button children (its nav links). */
function extraTypenamesFor(host: CampaignBlock): ExtraTypename[] {
  if (host.__typename === 'CampaignHeaderBlock') return ['CampaignButtonBlock']
  return [...EXTRA_TYPENAMES]
}

/** Where a new section goes and which types fit there. */
export interface SectionTarget {
  insert: SectionInsert
  typenames: CampaignSectionTypename[]
}

/**
 * The section an Extra is added to, and which side of the section's text it
 * sits on. A new Extra beside a selected Extra repeats its placement; added
 * to a section it takes the author's choice, `placement` being the default.
 */
export interface ExtraTarget {
  host: CampaignBlock
  placement: CampaignChildPlacement
  inheritsPlacement: boolean
  /** The Extra types the host renders, in Add Panel order. */
  typenames: ExtraTypename[]
}

/** What the Add Panel can add for a selection; a missing target means that group is unavailable. */
export interface AddTargets {
  section?: SectionTarget
  extra?: ExtraTarget
  line?: { region: CampaignRegion }
}

interface AddTargetsInput {
  selection: CampaignSelection
  campaign: Pick<Campaign, 'blocks' | 'pages'>
  /** The page the canvas shows: where nothing-selected adds go. */
  pageKind: CampaignPageKind
  /** An insert point the canvas chose; it overrides the selection's rule. */
  preset?: CampaignAddPreset
}

/**
 * The Add Panel's insertion rule, a pure function of the selection. Nothing
 * selected (or chrome, which sits on every page) → a section at the end of the
 * page the canvas shows, and an Extra into the chrome block: the header takes
 * buttons only, the footer text and buttons. A section, or an Extra / card in one → a section
 * below the section, and an Extra added to it. An empty Column Slot → a
 * section into it, filtered to what fits in a column; a section already in a
 * slot has no section sibling to add. An Extra → another Extra on the same
 * host and placement. A region card → a new Region Line. Region-page-only
 * section types are offered on the Region Page only. A preset insert point
 * (the canvas "+", an empty slot's placeholder) wins over all of this and
 * offers sections only, at that point.
 */
export function addTargets({
  selection,
  campaign,
  pageKind,
  preset
}: AddTargetsInput): AddTargets {
  const { blocks, pages } = campaign
  const kindOfPage = (pageId: string): CampaignPageKind =>
    pages.find((page) => page.id === pageId)?.kind ?? pageKind

  function endOfPage(): SectionTarget | undefined {
    const page = pages.find((candidate) => candidate.kind === pageKind)
    if (page == null) return undefined
    return {
      insert: {
        pageId: page.id,
        parentOrder: pageSections(blocks, page.id).length
      },
      typenames: sectionTypesForPage(pageKind)
    }
  }

  function belowSection(
    host: CampaignBlock | undefined
  ): SectionTarget | undefined {
    if (
      host?.pageId == null ||
      host.parentBlockId != null ||
      host.parentOrder == null
    )
      return endOfPage()
    return {
      insert: { pageId: host.pageId, parentOrder: host.parentOrder + 1 },
      typenames: sectionTypesForPage(kindOfPage(host.pageId))
    }
  }

  if (preset != null) {
    const presetPageKind = kindOfPage(preset.pageId)
    return {
      section: {
        insert: preset,
        typenames:
          preset.parentBlockId != null
            ? sectionTypesForSlot(presetPageKind)
            : sectionTypesForPage(presetPageKind)
      }
    }
  }

  switch (selection.kind) {
    case 'campaign':
      return { section: endOfPage() }
    case 'chrome':
      return {
        section: endOfPage(),
        extra: selection.host && {
          host: selection.host,
          placement: CampaignChildPlacement.below,
          inheritsPlacement: false,
          typenames: extraTypenamesFor(selection.host)
        }
      }
    case 'section':
      return {
        section: belowSection(selection.host),
        extra: selection.host && {
          host: selection.host,
          placement: CampaignChildPlacement.below,
          inheritsPlacement: false,
          typenames: extraTypenamesFor(selection.host)
        }
      }
    case 'column':
      return {
        extra: selection.host && {
          host: selection.host,
          placement: CampaignChildPlacement.below,
          inheritsPlacement: false,
          typenames: extraTypenamesFor(selection.host)
        }
      }
    case 'slot': {
      const slot = selection.block
      if (slot?.pageId == null) return {}
      const occupied = blocks.some(
        (candidate) => candidate.parentBlockId === slot.id
      )
      if (occupied) return {}
      return {
        section: {
          insert: {
            pageId: slot.pageId,
            parentOrder: 0,
            parentBlockId: slot.id
          },
          typenames: sectionTypesForSlot(kindOfPage(slot.pageId))
        }
      }
    }
    case 'text':
    case 'button': {
      const { block, host } = selection
      if (host == null) return {}
      const placement =
        block != null && 'placement' in block ? block.placement : null
      return {
        extra: {
          host,
          placement: placement ?? CampaignChildPlacement.below,
          inheritsPlacement: true,
          typenames: extraTypenamesFor(host)
        }
      }
    }
    case 'card':
    case 'journey':
      return { section: belowSection(selection.host) }
    case 'region':
      return selection.region == null
        ? {}
        : { line: { region: selection.region } }
  }
}
