import type { DndContextProps } from '@dnd-kit/core'
import { act, render } from '@testing-library/react'
import { ReactElement } from 'react'

import {
  campaign,
  campaignWithColumns,
  campaignWithRegions,
  eurLine
} from '../data'
import { StaticEditor } from '../testing'

import { Navigator } from './Navigator'
import { NavigatorHoverProvider } from './NavigatorHover'

const mocks = vi.hoisted(() => ({
  addBlockOrder: vi.fn(),
  addColumnSwap: vi.fn(),
  reorderRegion: vi.fn(),
  dnd: { current: undefined as DndContextProps | undefined }
}))

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>()
  return {
    ...actual,
    DndContext: (props: DndContextProps): ReactElement => {
      mocks.dnd.current = props
      return <actual.DndContext {...props} />
    }
  }
})

vi.mock('../utils/useCampaignBlockOrderCommand', () => ({
  useCampaignBlockOrderCommand: () => ({ addBlockOrder: mocks.addBlockOrder })
}))
vi.mock('../utils/useColumnSwapCommand', () => ({
  useColumnSwapCommand: () => ({ addColumnSwap: mocks.addColumnSwap })
}))
vi.mock('../utils/useCampaignRegionCommand', () => ({
  useCampaignRegionCommand: () => ({ reorderRegion: mocks.reorderRegion })
}))

function renderNavigator(campaignProp = campaign): void {
  render(
    <StaticEditor campaignProp={campaignProp}>
      <NavigatorHoverProvider>
        <Navigator />
      </NavigatorHoverProvider>
    </StaticEditor>
  )
}

/** Ends a drag of one row over another as the sensors report it. */
function drop(activeId: string, overId: string | undefined): void {
  act(() => {
    mocks.dnd.current?.onDragEnd?.({
      active: { id: activeId },
      collisions: overId == null ? [] : [{ id: overId }]
    } as unknown as Parameters<NonNullable<DndContextProps['onDragEnd']>>[0])
  })
}

describe('Navigator drop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reorders a section through the block order Command', () => {
    renderNavigator()

    drop('heroId', 'landingJourneyListId')

    expect(mocks.addBlockOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'heroId' }),
      3,
      undefined
    )
  })

  it('reorders a journey card through the block order Command', () => {
    renderNavigator()

    drop('landingDraftJourneyId', 'landingJourneyId')

    expect(mocks.addBlockOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'landingDraftJourneyId' }),
      1,
      undefined
    )
  })

  it('flips an Extra’s placement and reorders it in one Command when it crosses the divider', () => {
    renderNavigator()

    drop('journeyListNoteId', 'landingJourneyListId__content')

    expect(mocks.addBlockOrder).toHaveBeenCalledTimes(1)
    expect(mocks.addBlockOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'journeyListNoteId' }),
      0,
      'below'
    )
  })

  it('swaps the Column Slots through the swap Command, selecting the section in the slot', () => {
    renderNavigator(campaignWithColumns)

    drop('slotRightId', 'slotLeftId')

    expect(mocks.addColumnSwap).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'slotRightId' }),
      undefined
    )
    drop('slotLeftId', 'slotRightId')
    expect(mocks.addColumnSwap).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'slotLeftId' }),
      'slotRichTextId'
    )
  })

  it('reorders region cards through the region order Command', () => {
    renderNavigator(campaignWithRegions)

    drop('landingSwitcherId__eurRegionId', 'landingSwitcherId__afrRegionId')

    expect(mocks.reorderRegion).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'eurRegionId' }),
      1
    )
  })

  it('reorders a Region Line through the block order Command', () => {
    renderNavigator({
      ...campaignWithRegions,
      blocks: [
        ...campaignWithRegions.blocks,
        { ...eurLine, id: 'eurSecondLineId', parentOrder: 1 }
      ]
    })

    drop(
      'landingSwitcherId__eurRegionId__eurSecondLineId',
      'landingSwitcherId__eurRegionId__eurLineId'
    )

    expect(mocks.addBlockOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'eurSecondLineId' }),
      0,
      undefined
    )
  })

  it('does nothing for a drop outside the row’s sibling group', () => {
    renderNavigator()

    drop('heroId', 'landingJourneyId')
    drop('landingJourneyId', 'journeyListNoteId')
    drop('heroId', 'headerId')

    expect(mocks.addBlockOrder).not.toHaveBeenCalled()
    expect(mocks.addColumnSwap).not.toHaveBeenCalled()
    expect(mocks.reorderRegion).not.toHaveBeenCalled()
  })

  it('does nothing for a drop on nothing, or on the row itself', () => {
    renderNavigator()

    drop('heroId', undefined)
    drop('heroId', 'heroId')

    expect(mocks.addBlockOrder).not.toHaveBeenCalled()
  })
})
