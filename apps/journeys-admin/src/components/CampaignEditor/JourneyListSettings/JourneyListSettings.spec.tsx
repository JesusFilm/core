import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetCampaign_campaign_blocks_CampaignJourneyListBlock as CampaignJourneyListBlock } from '../../../../__generated__/GetCampaign'
import { CampaignJourneyListDisplay } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_DISPLAY } from '../../../libs/useCampaignJourneyListBlockDisplayMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { CommandProbe, SelectionProbe, StaticEditor } from '../testing'

import { JourneyListSettings } from './JourneyListSettings'

const list = campaign.blocks.find(
  (block) => block.id === 'landingJourneyListId'
) as CampaignJourneyListBlock

function displayMock(display: CampaignJourneyListDisplay) {
  return {
    request: {
      query: CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_DISPLAY,
      variables: { id: 'landingJourneyListId', input: { display } }
    },
    result: vi.fn(() => ({
      data: {
        campaignJourneyListBlockUpdate: {
          __typename: 'CampaignJourneyListBlock',
          id: 'landingJourneyListId',
          display
        }
      }
    }))
  }
}

function renderSettings(mocks: Array<Record<string, unknown>> = []): void {
  render(
    <StaticEditor mocks={mocks}>
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
})
