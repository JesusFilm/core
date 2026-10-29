import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock } from '../../../../../__generated__/GetCampaign'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import { QueriedEditor, SelectionProbe } from '../../testing'

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
  const { campaign: current } = useCampaignEditor()
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
      <span data-testid="InlineError">{error ?? ''}</span>
      <span data-testid="MinHeight">{String(cached?.minHeight)}</span>
    </>
  )
}

function renderCommand(
  mocks: Array<Record<string, unknown>>,
  minHeight = 70
): void {
  render(
    <QueriedEditor
      campaignData={campaignData}
      mocks={mocks}
      initialState={{ selectedBlockId: 'landingAnalyticsId' }}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <SelectionProbe />
      <Probe minHeight={minHeight} />
    </QueriedEditor>
  )
}

describe('useCampaignBlockFieldsCommand', () => {
  it('writes the fields, undoes to the values the cache held when the Command was added, and redoes', async () => {
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

  it('refocuses the block on undo and redo, not on the first execute', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    )
    expect(screen.getByTestId('PageKind')).toHaveTextContent('landing')
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
