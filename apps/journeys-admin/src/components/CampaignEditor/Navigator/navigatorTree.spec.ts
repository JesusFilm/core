import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'

import {
  NavigatorNode,
  ancestorIds,
  buildNavigatorTree,
  expandableIds,
  flattenNavigatorTree,
  selectedNodeId
} from './navigatorTree'

/** The tree as indented `type:id` lines, for readable assertions. */
function outline(nodes: NavigatorNode[], depth = 0): string[] {
  return nodes.flatMap((node) => [
    `${'  '.repeat(depth)}${node.type}:${node.id}`,
    ...outline(node.children, depth + 1)
  ])
}

function find(nodes: NavigatorNode[], id: string): NavigatorNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const below = find(node.children, id)
    if (below != null) return below
  }
  return undefined
}

describe('buildNavigatorTree', () => {
  it('lists the header, the landing sections in order and the footer', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    expect(tree.map((node) => node.id)).toEqual([
      'headerId',
      'heroId',
      'landingSwitcherId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId',
      'footerId'
    ])
  })

  it('lists the Region Page sections for the region being rendered', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithRegions,
      pageKind: CampaignPageKind.regionTemplate,
      currentRegionId: 'eurRegionId'
    })

    expect(tree.map((node) => node.id)).toEqual([
      'headerId',
      'regionHeaderId',
      'regionShareId',
      'regionJourneyListId',
      'regionAnalyticsId',
      'regionSwitcherId',
      'footerId'
    ])
  })

  it('nests a section’s Extras tagged above or below, around a divider where its content starts', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    const hero = find(tree, 'heroId')
    expect(hero?.children.map((node) => node.id)).toEqual([
      'heroId__content',
      'heroButtonId'
    ])
    expect(hero?.children[0]).toMatchObject({ type: 'SectionContent' })
    expect(hero?.children[1]).toMatchObject({
      type: 'CampaignButtonBlock',
      placement: 'below'
    })
    expect(find(tree, 'heroId')?.placement).toBeUndefined()
  })

  it('lists Extras as the canvas orders them: above, the body, below', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    expect(
      find(tree, 'landingJourneyListId')?.children.map((node) => node.id)
    ).toEqual([
      'journeyListNoteId',
      'landingJourneyListId__content',
      'landingJourneyId',
      'landingDraftJourneyId'
    ])
  })

  it('leaves out the divider when a section has no Extras', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    expect(find(tree, 'carouselId')?.children).toEqual([])
  })

  it('nests journey cards under their list in order', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    const list = find(tree, 'landingJourneyListId')
    expect(
      list?.children
        .filter((node) => node.type === 'CampaignJourneyBlock')
        .map((node) => node.id)
    ).toEqual(['landingJourneyId', 'landingDraftJourneyId'])
  })

  it('nests Columns › Column slot › its section', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithColumns,
      pageKind: CampaignPageKind.landing
    })

    expect(outline([find(tree, 'columnsId') as NavigatorNode])).toEqual([
      'CampaignColumnsBlock:columnsId',
      '  CampaignColumnBlock:slotLeftId',
      '    CampaignRichTextBlock:slotRichTextId',
      '  CampaignColumnBlock:slotRightId'
    ])
  })

  it('shows the block’s own title as the secondary text', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithColumns,
      pageKind: CampaignPageKind.landing
    })

    expect(find(tree, 'slotRichTextId')?.secondaryText).toBe('Our story')
    expect(find(tree, 'slotLeftId')?.secondaryText).toBeUndefined()
  })

  it('nests region cards in switcher order under a switcher, with their lines and badges', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithRegions,
      pageKind: CampaignPageKind.landing
    })

    const switcher = find(tree, 'landingSwitcherId')
    const cards = switcher?.children.filter((node) => node.type === 'Region')
    expect(cards?.map((card) => card.regionId)).toEqual([
      'eurRegionId',
      'afrRegionId'
    ])
    expect(cards?.[0]).toMatchObject({
      id: 'landingSwitcherId__eurRegionId',
      hostBlockId: 'landingSwitcherId',
      secondaryText: 'Europe',
      needsJourney: true,
      unlisted: false
    })
    expect(cards?.[1]).toMatchObject({ unlisted: true, needsJourney: true })
    expect(cards?.[0].children.map((line) => line.blockId)).toEqual([
      'eurLineId'
    ])
    expect(cards?.[1].children).toEqual([])
  })

  it('leaves the region being rendered out of its own Region Page’s switcher', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithRegions,
      pageKind: CampaignPageKind.regionTemplate,
      currentRegionId: 'eurRegionId'
    })

    expect(
      find(tree, 'regionSwitcherId')?.children.map((card) => card.regionId)
    ).toEqual(['afrRegionId'])
  })
})

describe('buildNavigatorTree sibling groups', () => {
  function groupsOf(nodes: NavigatorNode[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {}
    for (const node of flattenNavigatorTree(nodes)) {
      if (node.reorder == null) continue
      groups[node.reorder.group] = [
        ...(groups[node.reorder.group] ?? []),
        node.id
      ]
    }
    return groups
  }

  it('groups the page’s sections, leaving the header and footer out', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    expect(groupsOf(tree)['root:sections']).toEqual([
      'heroId',
      'landingSwitcherId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId'
    ])
    expect(find(tree, 'headerId')?.reorder).toBeUndefined()
    expect(find(tree, 'footerId')?.reorder).toBeUndefined()
  })

  it('groups Extras with the divider, and journey cards on their own', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    const groups = groupsOf(tree)
    expect(groups['landingJourneyListId:extras']).toEqual([
      'journeyListNoteId',
      'landingJourneyListId__content'
    ])
    expect(groups['landingJourneyListId:CampaignJourneyBlock']).toEqual([
      'landingJourneyId',
      'landingDraftJourneyId'
    ])
    expect(find(tree, 'journeyListNoteId')?.reorder?.kind).toBe('extra')
    expect(find(tree, 'landingJourneyId')?.reorder?.kind).toBe('block')
  })

  it('groups a Columns section’s two slots for a swap', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithColumns,
      pageKind: CampaignPageKind.landing
    })

    expect(groupsOf(tree)['columnsId:CampaignColumnBlock']).toEqual([
      'slotLeftId',
      'slotRightId'
    ])
    expect(find(tree, 'slotLeftId')?.reorder?.kind).toBe('columnSlot')
  })

  it('groups region cards in switcher order and each card’s lines', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithRegions,
      pageKind: CampaignPageKind.landing
    })

    expect(groupsOf(tree)['landingSwitcherId:Region']).toEqual([
      'landingSwitcherId__eurRegionId',
      'landingSwitcherId__afrRegionId'
    ])
    expect(find(tree, 'landingSwitcherId__eurRegionId')?.reorder?.kind).toBe(
      'region'
    )
  })

  it('leaves a lone row without a group', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithRegions,
      pageKind: CampaignPageKind.landing
    })

    expect(
      find(tree, 'landingSwitcherId__eurRegionId__eurLineId')?.reorder
    ).toBeUndefined()
  })
})

describe('selectedNodeId', () => {
  const tree = buildNavigatorTree({
    campaign: campaignWithRegions,
    pageKind: CampaignPageKind.landing
  })

  it('is the selected block’s row', () => {
    expect(
      selectedNodeId(tree, {
        kind: 'section',
        block: campaign.blocks.find((block) => block.id === 'heroId')
      })
    ).toBe('heroId')
  })

  it('is the region card of the switcher it was selected in', () => {
    expect(
      selectedNodeId(tree, {
        kind: 'region',
        region: campaignWithRegions.regions[1],
        host: campaign.blocks.find((block) => block.id === 'landingSwitcherId')
      })
    ).toBe('landingSwitcherId__afrRegionId')
  })

  it('is undefined with nothing selected', () => {
    expect(selectedNodeId(tree, { kind: 'campaign' })).toBeUndefined()
  })
})

describe('ancestorIds', () => {
  const tree = buildNavigatorTree({
    campaign: campaignWithColumns,
    pageKind: CampaignPageKind.landing
  })

  it('lists every ancestor, outermost first', () => {
    expect(ancestorIds(tree, 'slotRichTextId')).toEqual([
      'columnsId',
      'slotLeftId'
    ])
  })

  it('is empty for a top-level row and an unknown id', () => {
    expect(ancestorIds(tree, 'heroId')).toEqual([])
    expect(ancestorIds(tree, 'missing')).toEqual([])
    expect(ancestorIds(tree, undefined)).toEqual([])
  })
})

describe('expandableIds', () => {
  it('lists the rows that have children', () => {
    const tree = buildNavigatorTree({
      campaign: campaignWithColumns,
      pageKind: CampaignPageKind.landing
    })

    expect(expandableIds(tree)).toEqual(
      expect.arrayContaining(['columnsId', 'slotLeftId', 'heroId'])
    )
    expect(expandableIds(tree)).not.toContain('slotRightId')
  })
})
