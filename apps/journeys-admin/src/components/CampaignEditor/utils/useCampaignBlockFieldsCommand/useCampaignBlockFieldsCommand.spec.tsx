import { MockLink } from '@apollo/client/testing'
import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import { QueriedEditor, SelectionProbe, UndoRedo } from '../../testing'

import { useCampaignBlockFieldsCommand } from './useCampaignBlockFieldsCommand'

const hero: CampaignHeroBlock = {
  ...blockOf<'CampaignHeroBlock'>('heroId'),
  minHeight: 40
}
const campaignData = {
  ...campaign,
  blocks: campaign.blocks.map((block) => (block.id === hero.id ? hero : block))
}

function refused(mock: ReturnType<typeof blockUpdateMock>): typeof mock {
  return {
    ...mock,
    result: vi.fn(() => ({
      errors: [new GraphQLError('Minimum height is out of range')]
    }))
  }
}

/** Adds a min-height Command for the hero as the caller holds it, which may lag the cache. */
function Probe({ minHeight }: { minHeight: number }): ReactElement {
  const { campaign: current, selectBlock } = useCampaignEditor()
  const { addFields, error } = useCampaignBlockFieldsCommand()
  const cached = current.blocks.find((block) => block.id === hero.id) as
    | CampaignHeroBlock
    | undefined
  return (
    <>
      <button
        onClick={() => addFields({ ...hero, minHeight: 10 }, { minHeight })}
      >
        Set height
      </button>
      <Button
        onClick={() => addFields({ ...hero, minHeight: 10 }, { minHeight: 80 })}
      >
        Second height
      </Button>
      <Button
        onClick={() => addFields({ ...hero, minHeight: 10 }, { minHeight: 90 })}
      >
        Third height
      </Button>
      <button onClick={() => selectBlock(hero.id)}>Select hero</button>
      <span data-testid="InlineError">{error ?? ''}</span>
      <span data-testid="MinHeight">{String(cached?.minHeight)}</span>
    </>
  )
}

function renderCommand(mocks: MockLink.MockedResponse[], minHeight = 70): void {
  render(
    <QueriedEditor
      campaign={campaignData}
      mocks={mocks}
      initialState={{ selectedBlockId: 'landingAnalyticsId' }}
    >
      <UndoRedo />
      <SelectionProbe />
      <Probe minHeight={minHeight} />
    </QueriedEditor>
  )
}

describe('useCampaignBlockFieldsCommand', () => {
  it('writes the fields, undoes to the values the cache held when the Command first executes, and redoes', async () => {
    const execute = {
      ...blockUpdateMock(hero, { minHeight: 70 }),
      maxUsageCount: 2
    }
    const undo = blockUpdateMock(hero, { minHeight: 40 })
    renderCommand([execute, undo])

    fireEvent.click(await screen.findByRole('button', { name: 'Set height' }))
    await waitFor(() => expect(execute.result).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('MinHeight')).toHaveTextContent('70')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undo.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('MinHeight')).toHaveTextContent('40')
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(execute.result).toHaveBeenCalledTimes(2))
  })

  it('undoes rapid queued edits to the immediately preceding height and retains it across redo', async () => {
    const first = {
      ...blockUpdateMock(hero, { minHeight: 70 }),
      delay: 300,
      maxUsageCount: 2
    }
    const second = {
      ...blockUpdateMock(hero, { minHeight: 80 }),
      maxUsageCount: 3
    }
    const third = {
      ...blockUpdateMock(hero, { minHeight: 90 }),
      maxUsageCount: 2
    }
    renderCommand([first, second, third])

    fireEvent.click(await screen.findByRole('button', { name: 'Set height' }))
    await waitFor(() =>
      expect(screen.getByTestId('MinHeight')).toHaveTextContent('70')
    )
    fireEvent.click(screen.getByRole('button', { name: 'Second height' }))
    fireEvent.click(screen.getByRole('button', { name: 'Third height' }))
    expect(first.result).not.toHaveBeenCalled()
    expect(second.result).not.toHaveBeenCalled()
    expect(third.result).not.toHaveBeenCalled()
    await waitFor(() => expect(third.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(screen.getByTestId('MinHeight')).toHaveTextContent('80')
    )
    await waitFor(() => expect(second.result).toHaveBeenCalledTimes(2))

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(third.result).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('MinHeight')).toHaveTextContent('90')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(second.result).toHaveBeenCalledTimes(3))
    expect(screen.getByTestId('MinHeight')).toHaveTextContent('80')
  })

  it('returns to the selection the edit was made in on undo and redo, not on the first execute', async () => {
    const execute = {
      ...blockUpdateMock(hero, { minHeight: 70 }),
      maxUsageCount: 2
    }
    const undo = blockUpdateMock(hero, { minHeight: 40 })
    renderCommand([execute, undo])

    fireEvent.click(await screen.findByRole('button', { name: 'Set height' }))
    await waitFor(() => expect(execute.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingAnalyticsId'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select hero' }))
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingAnalyticsId'
    )
    expect(screen.getByTestId('PageKind')).toHaveTextContent('landing')
    await waitFor(() => expect(undo.result).toHaveBeenCalled())
  })

  it('shows a refused first execute inline', async () => {
    const execute = refused(blockUpdateMock(hero, { minHeight: 70 }))
    renderCommand([execute])

    fireEvent.click(await screen.findByRole('button', { name: 'Set height' }))

    await waitFor(() =>
      expect(screen.getByTestId('InlineError')).toHaveTextContent(
        'Minimum height is out of range'
      )
    )
    expect(screen.getAllByText('Minimum height is out of range')).toHaveLength(
      1
    )
  })

  it('reports a refused undo in the snackbar, not inline', async () => {
    const execute = blockUpdateMock(hero, { minHeight: 70 })
    const undo = refused(blockUpdateMock(hero, { minHeight: 40 }))
    renderCommand([execute, undo])

    fireEvent.click(await screen.findByRole('button', { name: 'Set height' }))
    await waitFor(() => expect(execute.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(
        screen.getByText('Minimum height is out of range')
      ).toBeInTheDocument()
    )
    expect(screen.getByTestId('InlineError')).toHaveTextContent('')
  })
})
