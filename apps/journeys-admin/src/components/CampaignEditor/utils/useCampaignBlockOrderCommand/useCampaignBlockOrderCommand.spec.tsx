import { MockLink } from '@apollo/client/testing'
import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { Inspector } from '../../Inspector'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import {
  BlocksProbe,
  QueriedEditor,
  SelectionProbe,
  SpyMock,
  UndoRedo,
  holdRequests,
  landRequests
} from '../../testing'
import { currentSiblings } from '../currentSiblings'
import { reorderedSiblings } from '../reorderedSiblings'
import { useCampaignBlockFieldsCommand } from '../useCampaignBlockFieldsCommand'

import { useCampaignBlockOrderCommand } from './useCampaignBlockOrderCommand'

const hero = campaign.blocks.find((block) => block.id === 'heroId')!
const switcher = campaign.blocks.find(
  (block) => block.id === 'landingSwitcherId'
)!
const footerPrivacy = campaign.blocks.find(
  (block) => block.id === 'footerPrivacyId'
)!

function sectionRows(order: string[]): Array<Record<string, unknown>> {
  return order.map((id, parentOrder) => ({
    __typename: campaign.blocks.find((block) => block.id === id)!.__typename,
    id,
    parentOrder
  }))
}

const moveUpMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'landingSwitcherId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: sectionRows([
        'landingSwitcherId',
        'heroId',
        'carouselId',
        'landingJourneyListId',
        'landingAnalyticsId'
      ])
    }
  }))
}

const moveBackMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'landingSwitcherId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: sectionRows([
        'heroId',
        'landingSwitcherId',
        'carouselId',
        'landingJourneyListId',
        'landingAnalyticsId'
      ])
    }
  }))
}

const crossBodyMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'footerPrivacyId', parentOrder: 0, placement: 'above' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerPrivacyId',
          parentOrder: 0,
          placement: 'above'
        },
        {
          __typename: 'CampaignTypographyBlock',
          id: 'footerCopyrightId',
          parentOrder: 1,
          placement: 'below'
        },
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerTermsId',
          parentOrder: 2,
          placement: 'below'
        }
      ]
    }
  }))
}

const crossBackMock: SpyMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'footerPrivacyId', parentOrder: 2, placement: 'below' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignTypographyBlock',
          id: 'footerCopyrightId',
          parentOrder: 0,
          placement: 'below'
        },
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerTermsId',
          parentOrder: 1,
          placement: 'below'
        },
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerPrivacyId',
          parentOrder: 2,
          placement: 'below'
        }
      ]
    }
  }))
}

function CrossBodyHarness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const privacy = current.blocks.find(
    (block) => block.id === 'footerPrivacyId'
  )!
  return (
    <Button
      onClick={() => addBlockOrder(privacy, 0, CampaignChildPlacement.above)}
    >
      Move above
    </Button>
  )
}

function QueuedMoves(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const { addFields } = useCampaignBlockFieldsCommand()
  return (
    <>
      <Button
        onClick={() =>
          addFields(blockOf<'CampaignHeroBlock'>('heroId'), { minHeight: 70 })
        }
      >
        Slow unrelated edit
      </Button>
      {[
        { name: 'First move', id: 'heroId', order: 1 },
        { name: 'Move sibling', id: 'carouselId', order: 4 },
        { name: 'Second move', id: 'heroId', order: 2 },
        {
          name: 'First placement',
          id: 'footerPrivacyId',
          order: 0,
          placement: CampaignChildPlacement.above
        },
        {
          name: 'Second placement',
          id: 'footerPrivacyId',
          order: 1,
          placement: CampaignChildPlacement.below
        }
      ].map(({ name, id, order, placement }) => (
        <Button
          key={name}
          onClick={() =>
            addBlockOrder(
              current.blocks.find((block) => block.id === id)!,
              order,
              placement
            )
          }
        >
          {name}
        </Button>
      ))}
    </>
  )
}

function slowEditMock(): SpyMock {
  return {
    ...blockUpdateMock(blockOf<'CampaignHeroBlock'>('heroId'), {
      minHeight: 70
    }),
    delay: 300
  }
}

function renderEditor(
  children?: ReactElement,
  mocks: MockLink.MockedResponse[] = [
    moveUpMock,
    moveBackMock,
    crossBodyMock,
    crossBackMock
  ]
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'landingSwitcherId' }}
      mocks={mocks}
    >
      <UndoRedo />
      <SelectionProbe />
      <BlocksProbe />
      <Inspector role="member" />
      {children}
    </QueriedEditor>
  )
}

describe('useCampaignBlockOrderCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  afterEach(() => vi.useRealTimers())

  it('captures each queued move at execution and uses current siblings on execute, undo and redo', async () => {
    function move(
      id: string,
      parentOrder: number,
      ids: string[],
      delay = 20
    ): SpyMock {
      return {
        request: {
          query: CAMPAIGN_BLOCK_ORDER_UPDATE,
          variables: { id, parentOrder }
        },
        result: vi.fn(() => ({
          data: { campaignBlockOrderUpdate: sectionRows(ids) }
        })),
        delay,
        maxUsageCount: 3
      }
    }
    const slow = slowEditMock()
    const first = move('heroId', 1, [
      'landingSwitcherId',
      'heroId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId'
    ])
    const sibling = move('carouselId', 4, [
      'landingSwitcherId',
      'heroId',
      'landingJourneyListId',
      'landingAnalyticsId',
      'carouselId'
    ])
    const second = move(
      'heroId',
      2,
      [
        'landingSwitcherId',
        'landingJourneyListId',
        'heroId',
        'landingAnalyticsId',
        'carouselId'
      ],
      300
    )
    const undo = move('heroId', 1, [
      'landingSwitcherId',
      'heroId',
      'landingJourneyListId',
      'landingAnalyticsId',
      'carouselId'
    ])
    render(
      <QueriedEditor
        mocks={[slow, { ...first, maxUsageCount: 1 }, sibling, second, undo]}
      >
        <QueuedMoves />
        <BlocksProbe />
        <UndoRedo />
      </QueriedEditor>
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Slow unrelated edit' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'First move' }))
    fireEvent.click(screen.getByRole('button', { name: 'Move sibling' }))
    fireEvent.click(screen.getByRole('button', { name: 'Second move' }))
    expect(slow.result).not.toHaveBeenCalled()
    expect(first.result).not.toHaveBeenCalled()

    await waitFor(() =>
      expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
        'CampaignHeroBlock||2|'
      )
    )
    expect(screen.getByTestId('Block-carouselId')).toHaveTextContent(
      'CampaignVideoCarouselBlock||4|'
    )
    expect(screen.getByTestId('Block-landingJourneyListId')).toHaveTextContent(
      'CampaignJourneyListBlock||1|'
    )
    expect(second.result).not.toHaveBeenCalled()
    await waitFor(() => expect(second.result).toHaveBeenCalledTimes(1))

    for (let replay = 1; replay <= 2; replay++) {
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undo.result).toHaveBeenCalledTimes(replay))
      expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
        'CampaignHeroBlock||1|'
      )
      expect(screen.getByTestId('Block-carouselId')).toHaveTextContent(
        'CampaignVideoCarouselBlock||4|'
      )
      if (replay === 2) break
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(second.result).toHaveBeenCalledTimes(2))
    }
  })

  it('keeps the execution-time placement snapshot across undo and redo of queued moves', async () => {
    const firstRows = reorderedSiblings(
      campaign.blocks,
      footerPrivacy,
      0,
      CampaignChildPlacement.above
    )
    const blocksAfterFirst = campaign.blocks.map((block) => {
      const row = firstRows.find((row) => row.id === block.id)
      if (row == null) return block
      return {
        ...block,
        parentOrder: row.parentOrder,
        ...('placement' in row && 'placement' in block
          ? { placement: row.placement }
          : {})
      }
    })
    const moved = blocksAfterFirst.find(
      (block) => block.id === footerPrivacy.id
    )!
    const secondRows = reorderedSiblings(
      blocksAfterFirst,
      moved,
      1,
      CampaignChildPlacement.below
    )
    const first: SpyMock = { ...crossBodyMock, maxUsageCount: 3 }
    const second: SpyMock = {
      request: {
        query: CAMPAIGN_BLOCK_ORDER_UPDATE,
        variables: { id: footerPrivacy.id, parentOrder: 1, placement: 'below' }
      },
      result: vi.fn(() => ({ data: { campaignBlockOrderUpdate: secondRows } })),
      maxUsageCount: 2
    }
    const slow = slowEditMock()
    render(
      <QueriedEditor mocks={[slow, first, second]}>
        <QueuedMoves />
        <BlocksProbe />
        <UndoRedo />
      </QueriedEditor>
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Slow unrelated edit' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'First placement' }))
    fireEvent.click(screen.getByRole('button', { name: 'Second placement' }))
    expect(first.result).not.toHaveBeenCalled()
    await waitFor(() => expect(second.result).toHaveBeenCalledTimes(1))

    for (let replay = 1; replay <= 2; replay++) {
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(first.result).toHaveBeenCalledTimes(replay + 1)
      )
      expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
        'CampaignButtonBlock|footerId|0|above|'
      )
      if (replay === 2) break
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(second.result).toHaveBeenCalledTimes(2))
      expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
        'CampaignButtonBlock|footerId|1|below|'
      )
    }
  })

  describe('reorderedSiblings', () => {
    it('places the block at the position and renumbers the page’s sections', () => {
      expect(
        reorderedSiblings(campaign.blocks, hero, 2).map((row) => [
          row.id,
          row.parentOrder
        ])
      ).toEqual([
        ['landingSwitcherId', 0],
        ['carouselId', 1],
        ['heroId', 2],
        ['landingJourneyListId', 3],
        ['landingAnalyticsId', 4]
      ])
    })

    it('clamps a position past the end and carries an Extra’s new placement', () => {
      const rows = reorderedSiblings(
        campaign.blocks,
        footerPrivacy,
        9,
        CampaignChildPlacement.above
      )

      expect(rows.map((row) => [row.id, row.parentOrder])).toEqual([
        ['footerCopyrightId', 0],
        ['footerTermsId', 1],
        ['footerPrivacyId', 2]
      ])
      expect(rows[2]).toMatchObject({ placement: 'above' })
      expect(rows[0]).toMatchObject({ placement: 'below' })
    })
  })

  it('lists the current order, the block included, for undo', () => {
    expect(
      currentSiblings(campaign.blocks, switcher).map((row) => [
        row.id,
        row.parentOrder
      ])
    ).toEqual([
      ['heroId', 0],
      ['landingSwitcherId', 1],
      ['carouselId', 2],
      ['landingJourneyListId', 3],
      ['landingAnalyticsId', 4]
    ])
  })

  it('moves a section with the bar’s arrow as one Command, renumbering at once, and undoes it', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-heroId')).toHaveTextContent(
      'CampaignHeroBlock||0|'
    )

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Move up' }))
    )

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingSwitcherId'
    )
    // Optimistic: renumbered before the request returns.
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||0|'
    )
    expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
      'CampaignHeroBlock||1|'
    )
    expect(moveUpMock.result).not.toHaveBeenCalled()
    await landRequests()
    expect(moveUpMock.result).toHaveBeenCalled()
    // Now first on the page, Move up is spent.
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    )

    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||1|'
    )
    expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
      'CampaignHeroBlock||0|'
    )
    expect(moveBackMock.result).not.toHaveBeenCalled()
    await landRequests()
    expect(moveBackMock.result).toHaveBeenCalled()
  })

  it('raises the API message in the error snackbar when the move is refused', async () => {
    renderEditor(undefined, [
      {
        ...moveUpMock,
        result: { errors: [{ message: 'The request was refused' }] }
      }
    ])
    expect(
      await screen.findByTestId('Block-landingSwitcherId')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('moves an Extra across the Section Body with its placement in the same Command, and undo puts both back', async () => {
    renderEditor(<CrossBodyHarness />)
    expect(
      await screen.findByTestId('Block-footerPrivacyId')
    ).toHaveTextContent('CampaignButtonBlock|footerId|2|below|')

    fireEvent.click(screen.getByRole('button', { name: 'Move above' }))

    await waitFor(() =>
      expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
        'CampaignButtonBlock|footerId|0|above|'
      )
    )
    expect(screen.getByTestId('Block-footerCopyrightId')).toHaveTextContent(
      'CampaignTypographyBlock|footerId|1|below|'
    )
    await waitFor(() => expect(crossBodyMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
        'CampaignButtonBlock|footerId|2|below|'
      )
    )
    expect(screen.getByTestId('Block-footerCopyrightId')).toHaveTextContent(
      'CampaignTypographyBlock|footerId|0|below|'
    )
    expect(screen.getByTestId('Block-footerTermsId')).toHaveTextContent(
      'CampaignButtonBlock|footerId|1|below|'
    )
    await waitFor(() => expect(crossBackMock.result).toHaveBeenCalled())
  })
})
