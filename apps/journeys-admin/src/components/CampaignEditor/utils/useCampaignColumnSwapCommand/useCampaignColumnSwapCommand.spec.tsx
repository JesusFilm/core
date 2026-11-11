import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { campaignWithColumns } from '../../data'
import { Inspector } from '../../Inspector'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  UndoRedo,
  holdRequests,
  landRequests
} from '../../testing'

function slotRows(order: string[]): Array<Record<string, unknown>> {
  return order.map((id, parentOrder) => ({
    __typename: 'CampaignColumnBlock',
    id,
    parentOrder
  }))
}

const swapMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotLeftId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: { campaignBlockOrderUpdate: slotRows(['slotRightId', 'slotLeftId']) }
  }))
}

const swapBackMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotLeftId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: { campaignBlockOrderUpdate: slotRows(['slotLeftId', 'slotRightId']) }
  }))
}

const swapFromRightMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotRightId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: { campaignBlockOrderUpdate: slotRows(['slotRightId', 'slotLeftId']) }
  }))
}

const swapAgainMock = { ...swapMock, result: vi.fn(swapMock.result) }

const refusal = { errors: [{ message: 'The request was refused' }] }

function renderEditor(
  selectedBlockId: string,
  mocks: MockLink.MockedResponse[] = [
    swapMock,
    swapBackMock,
    swapAgainMock,
    swapFromRightMock
  ]
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaign={campaignWithColumns}
      initialState={{ selectedBlockId, inspectorTab: 'settings' }}
      mocks={mocks}
    >
      <UndoRedo />
      <CommandProbe />
      <SelectionProbe />
      <BlocksProbe />
      <Inspector role="member" />
    </QueriedEditor>
  )
}

function parentOrderOf(id: string): string {
  return screen.getByTestId(`Block-${id}`).textContent?.split('|')[2] ?? ''
}

describe('useCampaignColumnSwapCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('swaps the two slots as one Command: order update on the slot, shown at once', async () => {
    renderEditor('slotRichTextId', [{ ...swapMock, delay: 0 }])
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotLeftId')).toBeInTheDocument()
    )
    expect(parentOrderOf('slotLeftId')).toBe('0')
    expect(parentOrderOf('slotRightId')).toBe('1')

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Swap columns' }))
    )
    try {
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      // Optimistic: renumbered before the held request returns.
      expect(parentOrderOf('slotLeftId')).toBe('1')
      expect(parentOrderOf('slotRightId')).toBe('0')
      expect(swapMock.result).not.toHaveBeenCalled()
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'slotRichTextId'
      )
    } finally {
      await landRequests()
    }
    expect(swapMock.result).toHaveBeenCalled()
    expect(parentOrderOf('slotLeftId')).toBe('1')
    expect(parentOrderOf('slotRightId')).toBe('0')
  })

  it('raises the API message in the error snackbar when the swap is refused', async () => {
    renderEditor('slotRichTextId', [{ ...swapMock, result: refusal }])
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotLeftId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Swap columns' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('swaps from a selected slot, keeping the slot selected', async () => {
    renderEditor('slotRightId')
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRightId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Swap columns' }))

    await waitFor(() => expect(swapFromRightMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotRightId'
    )
  })

  it('undoes the swap through the same mutation and redoes it', async () => {
    renderEditor('slotRichTextId')
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotLeftId')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Swap columns' }))
    await waitFor(() => expect(swapMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(parentOrderOf('slotLeftId')).toBe('0'))
    expect(parentOrderOf('slotRightId')).toBe('1')
    await waitFor(() => expect(swapBackMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(swapAgainMock.result).toHaveBeenCalled())
    expect(parentOrderOf('slotLeftId')).toBe('1')
    expect(parentOrderOf('slotRightId')).toBe('0')
  })
})
