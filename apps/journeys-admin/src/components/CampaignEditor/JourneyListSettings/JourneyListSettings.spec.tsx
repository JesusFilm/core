import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignJourneyListBlock as CampaignJourneyListBlock } from '../../../../__generated__/GetCampaign'
import { CampaignJourneyListDisplay } from '../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { blockUpdateMock } from '../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  StaticEditor
} from '../testing'

import { JourneyListSettings } from './JourneyListSettings'

const list = campaign.blocks.find(
  (block) => block.id === 'landingJourneyListId'
) as CampaignJourneyListBlock

function displayMock(display: CampaignJourneyListDisplay) {
  return blockUpdateMock(list, { display })
}

/** The settings over the block as the cache holds it, so a saved value flows back in. */
function CachedSettings(): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find(
    (candidate) => candidate.id === 'landingJourneyListId'
  )
  if (block?.__typename !== 'CampaignJourneyListBlock') return null
  return <JourneyListSettings block={block} />
}

function renderSettings(mocks: Array<Record<string, unknown>> = []): void {
  render(
    <StaticEditor
      initialState={{ selectedBlockId: 'landingJourneyListId' }}
      mocks={mocks}
    >
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <JourneyListSettings block={list} />
    </StaticEditor>
  )
}

describe('JourneyListSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Grid and List with the list’s own display pressed', () => {
    renderSettings()

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('changes the display as one Command through campaignJourneyListBlockUpdate, and undoes it', async () => {
    const asList = displayMock(CampaignJourneyListDisplay.list)
    const asGrid = displayMock(CampaignJourneyListDisplay.grid)
    renderSettings([asList, asGrid])

    fireEvent.click(screen.getByRole('button', { name: 'List' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(asList.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(asGrid.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingJourneyListId'
    )
  })

  it('does nothing when the pressed display is clicked again', () => {
    renderSettings()

    fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it.each([[CampaignJourneyListDisplay.list]])(
    'round-trips %s through the cache',
    async (value) => {
      const mock = displayMock(value)
      render(
        <QueriedEditor mocks={[mock]}>
          <CachedSettings />
        </QueriedEditor>
      )
      await screen.findByRole('button', { name: 'Grid' })

      fireEvent.click(screen.getByRole('button', { name: 'List' }))

      await waitFor(() => expect(mock.result).toHaveBeenCalled())
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
          'aria-pressed',
          'true'
        )
      )
    }
  )
})
