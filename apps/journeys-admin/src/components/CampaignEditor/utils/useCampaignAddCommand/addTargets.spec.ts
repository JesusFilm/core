import {
  CampaignChildPlacement,
  CampaignPageKind
} from '../../../../../__generated__/globalTypes'
import {
  CAMPAIGN_SECTION_TYPENAMES,
  CampaignSectionTypename
} from '../../../../libs/useCampaignSectionCreateMutation'
import { resolveSelection } from '../../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../../data'
import {
  REGION_ONLY_TYPENAMES,
  SLOT_DISALLOWED_TYPENAMES
} from '../sectionTypes'

import { AddTargets, addTargets } from './addTargets'

function targetsFor(
  selectedBlockId: string | undefined,
  options: {
    campaignProp?: typeof campaign
    pageKind?: CampaignPageKind
    selectedRegionId?: string
  } = {}
): AddTargets {
  const {
    campaignProp = campaign,
    pageKind = CampaignPageKind.landing,
    selectedRegionId
  } = options
  return addTargets({
    selection: resolveSelection(
      campaignProp.blocks,
      selectedBlockId,
      campaignProp.regions,
      selectedRegionId
    ),
    campaign: campaignProp,
    pageKind
  })
}

function hasType(
  targets: AddTargets,
  typenames: readonly CampaignSectionTypename[]
): boolean {
  return typenames.some((typename) =>
    targets.section?.typenames.includes(typename)
  )
}

describe('addTargets', () => {
  it('adds a section at the end of the landing page when nothing is selected, and no Extra or line', () => {
    const landingSections = campaign.blocks.filter(
      (block) =>
        block.pageId === 'landingPageId' &&
        block.parentBlockId == null &&
        block.parentOrder != null
    )

    const targets = targetsFor(undefined)

    expect(targets.section?.insert).toEqual({
      pageId: 'landingPageId',
      parentOrder: landingSections.length
    })
    expect(targets.extra).toBeUndefined()
    expect(targets.line).toBeUndefined()
  })

  it('adds at the end of the Region Page when it is the page shown', () => {
    const targets = targetsFor(undefined, {
      pageKind: CampaignPageKind.regionTemplate
    })

    expect(targets.section?.insert.pageId).toBe('regionPageId')
    expect(targets.section?.typenames).toEqual([...CAMPAIGN_SECTION_TYPENAMES])
  })

  it('adds a section below the selected section and an Extra into it, either side of its text', () => {
    const targets = targetsFor('heroId')

    expect(targets.section?.insert).toEqual({
      pageId: 'landingPageId',
      parentOrder: 1
    })
    expect(targets.extra).toMatchObject({
      host: { id: 'heroId' },
      placement: CampaignChildPlacement.below,
      inheritsPlacement: false
    })
  })

  it('offers the region-only section types on the Region Page only', () => {
    expect(hasType(targetsFor('heroId'), REGION_ONLY_TYPENAMES)).toBe(false)
    expect(hasType(targetsFor(undefined), REGION_ONLY_TYPENAMES)).toBe(false)
    expect(
      REGION_ONLY_TYPENAMES.every((typename) =>
        targetsFor(undefined, {
          pageKind: CampaignPageKind.regionTemplate
        }).section?.typenames.includes(typename)
      )
    ).toBe(true)
  })

  it('adds to the end of the page after chrome, and an Extra into the chrome block', () => {
    const targets = targetsFor('footerId')

    expect(targets.section?.insert.pageId).toBe('landingPageId')
    expect(targets.extra).toMatchObject({
      host: { id: 'footerId' },
      inheritsPlacement: false,
      typenames: ['CampaignTypographyBlock', 'CampaignButtonBlock']
    })
  })

  it('offers only a button Extra for the header, which renders no text children', () => {
    expect(targetsFor('headerId').extra).toMatchObject({
      host: { id: 'headerId' },
      typenames: ['CampaignButtonBlock']
    })
  })

  it('adds a section into an empty Column Slot, hiding the slot-disallowed types', () => {
    const targets = targetsFor('slotRightId', {
      campaignProp: campaignWithColumns
    })

    expect(targets.section?.insert).toEqual({
      pageId: 'landingPageId',
      parentOrder: 0,
      parentBlockId: 'slotRightId'
    })
    expect(hasType(targets, SLOT_DISALLOWED_TYPENAMES)).toBe(false)
    expect(hasType(targets, REGION_ONLY_TYPENAMES)).toBe(false)
    expect(targets.section?.typenames).toContain('CampaignHeroBlock')
    expect(targets.extra).toBeUndefined()
  })

  it('adds nothing into a Column Slot that already holds a section', () => {
    expect(
      targetsFor('slotLeftId', { campaignProp: campaignWithColumns })
    ).toEqual({})
  })

  it('offers only Extras for a section inside a column', () => {
    const targets = targetsFor('slotRichTextId', {
      campaignProp: campaignWithColumns
    })

    expect(targets.section).toBeUndefined()
    expect(targets.extra).toMatchObject({ host: { id: 'slotRichTextId' } })
  })

  it('adds an Extra after the selected Extra on the same host and placement', () => {
    const aboveCampaign = {
      ...campaign,
      blocks: campaign.blocks.map((block) =>
        block.id === 'heroButtonId'
          ? { ...block, placement: CampaignChildPlacement.above }
          : block
      )
    }
    const targets = targetsFor('heroButtonId', {
      campaignProp: aboveCampaign
    })

    expect(targets.section).toBeUndefined()
    expect(targets.extra).toMatchObject({
      host: { id: 'heroId' },
      placement: CampaignChildPlacement.above,
      inheritsPlacement: true
    })
  })

  it('adds a new Region Line for a selected region card, and nothing else', () => {
    const targets = targetsFor('landingSwitcherId', {
      campaignProp: campaignWithRegions,
      selectedRegionId: 'eurRegionId'
    })

    expect(targets).toEqual({
      line: { region: expect.objectContaining({ id: 'eurRegionId' }) }
    })
  })

  describe('with a preset insert point', () => {
    it('offers sections only, at the preset position, whatever is selected', () => {
      const targets = addTargets({
        selection: resolveSelection(campaign.blocks, 'heroId'),
        campaign,
        pageKind: CampaignPageKind.landing,
        preset: { pageId: 'landingPageId', parentOrder: 2 }
      })

      expect(targets).toEqual({
        section: {
          insert: { pageId: 'landingPageId', parentOrder: 2 },
          typenames: expect.arrayContaining(['CampaignHeroBlock'])
        }
      })
      expect(hasType(targets, SLOT_DISALLOWED_TYPENAMES)).toBe(true)
    })

    it('hides slot-disallowed types when the preset is a Column Slot', () => {
      const targets = addTargets({
        selection: resolveSelection(campaignWithColumns.blocks, 'slotRightId'),
        campaign: campaignWithColumns,
        pageKind: CampaignPageKind.landing,
        preset: {
          pageId: 'landingPageId',
          parentOrder: 0,
          parentBlockId: 'slotRightId'
        }
      })

      expect(targets.section?.insert).toEqual({
        pageId: 'landingPageId',
        parentOrder: 0,
        parentBlockId: 'slotRightId'
      })
      expect(hasType(targets, SLOT_DISALLOWED_TYPENAMES)).toBe(false)
    })
  })

  it('adds a section below the section a card or journey item sits in', () => {
    const targets = targetsFor('landingJourneyId')

    expect(targets.section?.insert).toEqual({
      pageId: 'landingPageId',
      parentOrder: 4
    })
    expect(targets.extra).toBeUndefined()
  })
})
