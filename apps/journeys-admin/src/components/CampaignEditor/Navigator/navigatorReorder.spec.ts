import { ClientRect, DroppableContainer } from '@dnd-kit/core'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import {
  CampaignChildPlacement,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import {
  campaign,
  campaignWithColumns,
  campaignWithRegions,
  eurLine
} from '../data'

import {
  droppablesInGroupOf,
  navigatorCollisionDetection,
  planReorder
} from './navigatorReorder'
import { buildNavigatorTree } from './navigatorTree'

function extra(
  template: CampaignBlock,
  id: string,
  parentOrder: number,
  placement: CampaignChildPlacement
): CampaignBlock {
  return {
    ...template,
    id,
    parentOrder,
    placement,
    parentBlockId: 'landingJourneyListId'
  } as CampaignBlock
}

const heroButton = campaign.blocks.find(
  (block) => block.id === 'heroButtonId'
) as CampaignBlock

/**
 * The journey list holds, by parentOrder: noteAbove (0, above), two journey
 * cards (1, 2), tailBelow (3, below) and lastBelow (4, below).
 */
const campaignWithExtras: Campaign = {
  ...campaign,
  blocks: [
    ...campaign.blocks,
    extra(heroButton, 'tailBelowId', 3, CampaignChildPlacement.below),
    extra(heroButton, 'lastBelowId', 4, CampaignChildPlacement.below)
  ]
}

function plan(
  campaignProp: Campaign,
  activeId: string,
  overId: string,
  pageKind = CampaignPageKind.landing
): ReturnType<typeof planReorder> {
  return planReorder({
    campaign: campaignProp,
    tree: buildNavigatorTree({ campaign: campaignProp, pageKind }),
    activeId,
    overId
  })
}

function block(id: string): CampaignBlock {
  return campaignWithExtras.blocks.find(
    (candidate) => candidate.id === id
  ) as CampaignBlock
}

describe('planReorder', () => {
  describe('sections', () => {
    it('drops a section down onto another section’s place', () => {
      expect(plan(campaign, 'heroId', 'landingJourneyListId')).toEqual({
        kind: 'block',
        block: expect.objectContaining({ id: 'heroId' }),
        parentOrder: 3
      })
    })

    it('drops a section up onto another section’s place', () => {
      expect(
        plan(campaign, 'landingAnalyticsId', 'landingSwitcherId')
      ).toMatchObject({ kind: 'block', parentOrder: 1 })
    })

    it('does nothing for a section dropped on itself', () => {
      expect(plan(campaign, 'heroId', 'heroId')).toBeUndefined()
    })

    it('never accepts a drop on the header or the footer', () => {
      expect(plan(campaign, 'heroId', 'headerId')).toBeUndefined()
      expect(plan(campaign, 'heroId', 'footerId')).toBeUndefined()
    })

    it('never accepts a drop on a row of another parent', () => {
      expect(plan(campaign, 'heroId', 'landingJourneyId')).toBeUndefined()
    })
  })

  describe('cards', () => {
    it('reorders journey cards among their siblings, Extras counted', () => {
      expect(
        plan(campaignWithExtras, 'landingDraftJourneyId', 'landingJourneyId')
      ).toMatchObject({
        kind: 'block',
        block: expect.objectContaining({ id: 'landingDraftJourneyId' }),
        parentOrder: 1
      })
    })

    it('never accepts a journey card dropped on an Extra', () => {
      expect(
        plan(campaignWithExtras, 'landingJourneyId', 'tailBelowId')
      ).toBeUndefined()
    })
  })

  describe('Extras', () => {
    it('reorders within a placement without sending a placement', () => {
      expect(plan(campaignWithExtras, 'tailBelowId', 'lastBelowId')).toEqual({
        kind: 'block',
        block: block('tailBelowId'),
        parentOrder: 4
      })
    })

    it('flips below to above when dragged past the divider, in the same plan', () => {
      expect(
        plan(campaignWithExtras, 'tailBelowId', 'journeyListNoteId')
      ).toEqual({
        kind: 'block',
        block: block('tailBelowId'),
        parentOrder: 0,
        placement: CampaignChildPlacement.above
      })
    })

    it('flips above to below when dragged past the divider', () => {
      expect(
        plan(campaignWithExtras, 'journeyListNoteId', 'tailBelowId')
      ).toEqual({
        kind: 'block',
        block: block('journeyListNoteId'),
        parentOrder: 3,
        placement: CampaignChildPlacement.below
      })
    })

    it('becomes the first below Extra when dropped on the divider', () => {
      expect(
        plan(
          campaignWithExtras,
          'journeyListNoteId',
          'landingJourneyListId__content'
        )
      ).toEqual({
        kind: 'block',
        block: block('journeyListNoteId'),
        parentOrder: 2,
        placement: CampaignChildPlacement.below
      })
    })

    it('flips placement even when the order does not change', () => {
      expect(plan(campaign, 'heroButtonId', 'heroId__content')).toEqual({
        kind: 'block',
        block: expect.objectContaining({ id: 'heroButtonId' }),
        parentOrder: 0,
        placement: CampaignChildPlacement.above
      })
    })

    it('never drags the divider', () => {
      expect(
        plan(campaignWithExtras, 'landingJourneyListId__content', 'tailBelowId')
      ).toBeUndefined()
    })
  })

  describe('Column Slots', () => {
    it('swaps a slot with the other slot of its Columns section', () => {
      expect(plan(campaignWithColumns, 'slotRightId', 'slotLeftId')).toEqual({
        kind: 'swap',
        slot: expect.objectContaining({ id: 'slotRightId' })
      })
    })
  })

  describe('region cards', () => {
    it('reorders through the region order, to the place of the card dropped on', () => {
      expect(
        plan(
          campaignWithRegions,
          'landingSwitcherId__eurRegionId',
          'landingSwitcherId__afrRegionId'
        )
      ).toEqual({
        kind: 'region',
        region: expect.objectContaining({ id: 'eurRegionId' }),
        order: 1
      })
      expect(
        plan(
          campaignWithRegions,
          'landingSwitcherId__afrRegionId',
          'landingSwitcherId__eurRegionId'
        )
      ).toMatchObject({ kind: 'region', order: 0 })
    })

    it('never accepts a region card dropped on a line', () => {
      expect(
        plan(
          campaignWithRegions,
          'landingSwitcherId__eurRegionId',
          'landingSwitcherId__eurRegionId__eurLineId'
        )
      ).toBeUndefined()
    })
  })

  describe('Region Lines', () => {
    it('reorders a line among its region’s lines through the block order', () => {
      const withTwoLines: Campaign = {
        ...campaignWithRegions,
        blocks: [
          ...campaignWithRegions.blocks,
          { ...eurLine, id: 'eurSecondLineId', parentOrder: 1 }
        ]
      }

      expect(
        plan(
          withTwoLines,
          'landingSwitcherId__eurRegionId__eurSecondLineId',
          'landingSwitcherId__eurRegionId__eurLineId'
        )
      ).toEqual({
        kind: 'block',
        block: expect.objectContaining({ id: 'eurSecondLineId' }),
        parentOrder: 0
      })
    })
  })
})

function container(id: string, group: string | undefined): DroppableContainer {
  return {
    id,
    data: { current: { group } },
    disabled: false,
    node: { current: null },
    rect: { current: null }
  } as unknown as DroppableContainer
}

function rect(top: number): ClientRect {
  return {
    top,
    bottom: top + 40,
    left: 0,
    right: 200,
    width: 200,
    height: 40
  }
}

describe('droppablesInGroupOf', () => {
  const containers = [
    container('a1', 'parent:cards'),
    container('a2', 'parent:cards'),
    container('b1', 'parent:extras'),
    container('c1', undefined)
  ]

  it('keeps only the rows of the dragged row’s own group', () => {
    const active = { data: { current: { group: 'parent:cards' } } }

    expect(droppablesInGroupOf(active, containers).map((c) => c.id)).toEqual([
      'a1',
      'a2'
    ])
  })

  it('keeps nothing for a row without a group', () => {
    expect(droppablesInGroupOf({ data: { current: {} } }, containers)).toEqual(
      []
    )
    expect(droppablesInGroupOf(null, containers)).toEqual([])
  })
})

describe('navigatorCollisionDetection', () => {
  const containers = [
    container('a1', 'cards'),
    container('a2', 'cards'),
    container('b1', 'extras')
  ]
  const droppableRects = new Map([
    ['a1', rect(0)],
    ['a2', rect(40)],
    ['b1', rect(80)]
  ])

  function collide(pointerY: number): string[] {
    return navigatorCollisionDetection({
      active: { id: 'a1', data: { current: { group: 'cards' } } },
      collisionRect: rect(pointerY - 20),
      droppableRects,
      droppableContainers: containers,
      pointerCoordinates: { x: 100, y: pointerY }
    } as unknown as Parameters<typeof navigatorCollisionDetection>[0]).map(
      (collision) => String(collision.id)
    )
  }

  it('finds the sibling under the pointer', () => {
    expect(collide(60)[0]).toBe('a2')
  })

  it('never collides with a row of another group, even under the pointer', () => {
    const ids = collide(100)

    expect(ids).not.toContain('b1')
    expect(ids[0]).toBe('a2')
  })
})
