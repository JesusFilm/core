import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { columnsGridTemplate } from '@core/journeys/ui/Campaign'

import { CAMPAIGN_COLUMNS_BLOCK_UPDATE_RATIO } from '../../../libs/useCampaignColumnsBlockRatioMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaignWithColumns } from '../data'
import { StyleMock, WithBlock } from '../styleTesting'
import { CommandProbe, QueriedEditor } from '../testing'

import { ColumnsRatio } from './ColumnsRatio'

function ratioMock(ratio: string, current = 'equal'): StyleMock {
  return {
    request: {
      query: CAMPAIGN_COLUMNS_BLOCK_UPDATE_RATIO,
      variables: { id: 'columnsId', input: { ratio } }
    },
    result: vi.fn(() => ({
      data: {
        campaignColumnsBlockUpdate: {
          __typename: 'CampaignColumnsBlock',
          id: 'columnsId',
          ratio: ratio ?? current
        }
      }
    }))
  }
}

/** The grid template the canvas gives the Columns section as the block holds it now. */
function GridProbe(): ReactElement | null {
  const { campaign } = useCampaignEditor()
  const block = campaign.blocks.find(
    (candidate) => candidate.id === 'columnsId'
  )
  if (block?.__typename !== 'CampaignColumnsBlock') return null
  return (
    <span data-testid="GridTemplate">{columnsGridTemplate(block.ratio)}</span>
  )
}

function renderRatio(mocks: StyleMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      mocks={mocks}
      campaignProp={campaignWithColumns}
      initialState={{ selectedBlockId: 'columnsId' }}
    >
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <GridProbe />
      <WithBlock blockId="columnsId" typename="CampaignColumnsBlock">
        {(block) => <ColumnsRatio block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

describe('ColumnsRatio', () => {
  beforeEach(() => vi.clearAllMocks())

  it('offers the enum’s three ratios with the block’s selected', async () => {
    renderRatio([])

    const equal = await screen.findByRole('button', { name: 'Equal' })
    expect(
      screen.getAllByRole('button').map((button) => button.textContent)
    ).toEqual(['Undo', 'Equal', 'Wide left', 'Wide right'])
    expect(equal).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes the ratio as one Command through the columns update, and the grid follows', async () => {
    const mocks = [ratioMock('wideLeft'), ratioMock('equal')]
    renderRatio(mocks)

    expect(await screen.findByTestId('GridTemplate')).toHaveTextContent(
      'minmax(0, 1fr) minmax(0, 1fr)'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Wide left' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('GridTemplate')).toHaveTextContent(
      'minmax(0, 2fr) minmax(0, 1fr)'
    )
    expect(screen.getByRole('button', { name: 'Wide left' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('GridTemplate')).toHaveTextContent(
        'minmax(0, 1fr) minmax(0, 1fr)'
      )
    )
  })

  it('writes nothing when the current ratio is chosen again', async () => {
    const mocks = [ratioMock('equal')]
    renderRatio(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Equal' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    expect(mocks[0].result).not.toHaveBeenCalled()
  })

  it('shows the API message verbatim when the save fails', async () => {
    const failing: StyleMock = {
      ...ratioMock('wideRight'),
      result: vi.fn(() => ({
        errors: [{ message: 'ratio: not equal, wideLeft or wideRight' }]
      }))
    }
    renderRatio([failing])

    fireEvent.click(await screen.findByRole('button', { name: 'Wide right' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ratio: not equal, wideLeft or wideRight'
    )
  })
})
