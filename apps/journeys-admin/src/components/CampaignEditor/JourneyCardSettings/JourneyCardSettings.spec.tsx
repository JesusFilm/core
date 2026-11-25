import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetCampaign_campaign_blocks_CampaignJourneyBlock as CampaignJourneyBlock } from '../../../../__generated__/GetCampaign'
import { campaign } from '../data'
import { blockUpdateMock } from '../styleTesting'
import { CommandProbe, StaticEditor } from '../testing'

import { JourneyCardSettings } from './JourneyCardSettings'

const card = campaign.blocks.find(
  (block) => block.id === 'landingJourneyId'
) as CampaignJourneyBlock

const titleMock = blockUpdateMock(card, { title: 'A new title' })

function renderSettings(): void {
  render(
    <StaticEditor mocks={[titleMock]}>
      <CommandProbe />
      <JourneyCardSettings block={card} />
    </StaticEditor>
  )
}

describe('JourneyCardSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the snapshot title and description with their counters, and Refresh from journey', () => {
    renderSettings()

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
      card.title
    )
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      card.description
    )
    expect(
      screen.getByText(`${[...(card.title ?? '')].length} / 200`)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Refresh from journey' })
    ).toBeEnabled()
  })

  it('writes the title as one Command through campaignJourneyBlockUpdate', async () => {
    renderSettings()
    const title = screen.getByRole('textbox', { name: 'Title' })

    fireEvent.focus(title)
    fireEvent.change(title, { target: { value: 'A new title' } })

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(titleMock.result).toHaveBeenCalled())
  })
})
