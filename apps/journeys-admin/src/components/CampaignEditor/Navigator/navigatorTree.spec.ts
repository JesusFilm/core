import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'

import {
  NavigatorNode,
  ancestorIds,
  buildNavigatorTree,
  expandableIds,
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

  it('nests a section’s Extras in parentOrder, tagged above or below', () => {
    const tree = buildNavigatorTree({
      campaign,
      pageKind: CampaignPageKind.landing
    })

    const hero = find(tree, 'heroId')
    expect(hero?.children.map((node) => node.id)).toEqual(['heroButtonId'])
    expect(hero?.children[0]).toMatchObject({
      type: 'CampaignButtonBlock',
      placement: expect.stringMatching(/^(above|below)$/)
    })
    expect(find(tree, 'heroId')?.placement).toBeUndefined()
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
