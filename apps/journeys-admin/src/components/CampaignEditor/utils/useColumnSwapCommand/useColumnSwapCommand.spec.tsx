import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BottomBar } from '../../BottomBar'
import { campaignWithColumns } from '../../data'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  SelectionProbe
} from '../../testing'

function slotRows(order: string[]): Array<Record<string, unknown>> {
  return order.map((id, parentOrder) => ({
    __typename: 'CampaignColumnBlock',
    id,
    parentOrder
  }))
}

const swapMock = {
  delay: 100,
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotLeftId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: { campaignBlockOrderUpdate: slotRows(['slotRightId', 'slotLeftId']) }
  }))
}

const swapBackMock = {
  delay: 100,
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotLeftId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: { campaignBlockOrderUpdate: slotRows(['slotLeftId', 'slotRightId']) }
  }))
}

const swapFromRightMock = {
  delay: 100,
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotRightId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: { campaignBlockOrderUpdate: slotRows(['slotRightId', 'slotLeftId']) }
  }))
}

const swapAgainMock = { ...swapMock, result: vi.fn(swapMock.result) }

function renderEditor(selectedBlockId: string): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaignData={campaignWithColumns}
      initialState={{ selectedBlockId }}
      mocks={[swapMock, swapBackMock, swapAgainMock, swapFromRightMock]}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <BlocksProbe />
      <BottomBar onSettingsClick={vi.fn()} />
    </QueriedEditor>
  )
}

function parentOrderOf(id: string): string {
  return screen.getByTestId(`Block-${id}`).textContent?.split('|')[2] ?? ''
}

describe('useColumnSwapCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('swaps the two slots as one Command: order update on the slot, shown at once', async () => {
    renderEditor('slotRichTextId')
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotLeftId')).toBeInTheDocument()
    )
    expect(parentOrderOf('slotLeftId')).toBe('0')
    expect(parentOrderOf('slotRightId')).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: 'Swap columns' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    // Optimistic: renumbered before the request returns.
    await waitFor(() => expect(parentOrderOf('slotLeftId')).toBe('1'))
    expect(parentOrderOf('slotRightId')).toBe('0')
    expect(swapMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotRichTextId'
    )
    await waitFor(() => expect(swapMock.result).toHaveBeenCalled())
    expect(parentOrderOf('slotLeftId')).toBe('1')
    expect(parentOrderOf('slotRightId')).toBe('0')
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
