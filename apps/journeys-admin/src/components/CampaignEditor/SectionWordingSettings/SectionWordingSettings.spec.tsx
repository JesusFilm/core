import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_STRING_UPDATE } from '../../../libs/useCampaignStringUpdateMutation'
import { campaign } from '../data'
import { StaticEditor } from '../testing'

import { SectionWordingSettings, stringKeyLabel } from './SectionWordingSettings'

const journeyList = campaign.blocks.find(
  (block) => block.id === 'landingJourneyListId'
)!
const noJourneys = campaign.strings.find(
  (string) => string.key === CampaignStringKey.noJourneys
)!

function stringMock(value: string): Record<string, unknown> {
  return {
    request: {
      query: CAMPAIGN_STRING_UPDATE,
      variables: { campaignId: campaign.id, key: 'noJourneys', value }
    },
    result: vi.fn(() => ({
      data: {
        campaignStringUpdate: {
          __typename: 'CampaignString',
          id: noJourneys.id,
          key: 'noJourneys',
          value
        }
      }
    }))
  }
}

describe('SectionWordingSettings', () => {
  it('lists the wording a Journey List shows, each named for where it shows', () => {
    render(
      <StaticEditor initialState={{ previewLanguageId: '529' }}>
        <SectionWordingSettings block={journeyList} />
      </StaticEditor>
    )

    expect(
      screen.getByRole('textbox', { name: 'Open journey button' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'No journeys message' })
    ).toHaveValue('Journeys for this region are coming soon')
  })

  it('saves an edit through campaignStringUpdate', async () => {
    const mock = stringMock('Coming soon')
    render(
      <StaticEditor
        mocks={[mock]}
        initialState={{ previewLanguageId: '529' }}
      >
        <SectionWordingSettings block={journeyList} />
      </StaticEditor>
    )

    const input = screen.getByRole('textbox', { name: 'No journeys message' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Coming soon' } })

    await waitFor(() => expect(mock.result).toHaveBeenCalled())
  })

  it('renders nothing for a section that reads no wording', () => {
    const hero = campaign.blocks.find((block) => block.id === 'heroId')!
    render(
      <StaticEditor>
        <SectionWordingSettings block={hero} />
      </StaticEditor>
    )

    expect(screen.queryByTestId('SectionWordingSettings')).toBeNull()
  })

  it('names every key', () => {
    const t = (key: string): string => key
    for (const key of Object.values(CampaignStringKey)) {
      expect(stringKeyLabel(t, key)).not.toBe(key)
    }
  })
})
