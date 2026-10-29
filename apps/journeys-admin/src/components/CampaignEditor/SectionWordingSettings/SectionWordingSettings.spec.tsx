import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react'
import { useTranslation } from 'next-i18next/pages'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_STRING_UPDATE } from '../../../libs/useCampaignStringUpdateMutation'
import { campaign } from '../data'
import { StaticEditor } from '../testing'

import {
  SectionWordingSettings,
  stringKeyLabel
} from './SectionWordingSettings'

function blockById(id: string): (typeof campaign.blocks)[number] {
  return campaign.blocks.find((block) => block.id === id)!
}

const journeyList = blockById('landingJourneyListId')
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
      <StaticEditor mocks={[mock]} initialState={{ previewLanguageId: '529' }}>
        <SectionWordingSettings block={journeyList} />
      </StaticEditor>
    )

    const input = screen.getByRole('textbox', { name: 'No journeys message' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Coming soon' } })

    await waitFor(() => expect(mock.result).toHaveBeenCalled())
  })

  it('keeps a line break through an edit', async () => {
    const mock = stringMock('Coming\nsoon')
    render(
      <StaticEditor mocks={[mock]} initialState={{ previewLanguageId: '529' }}>
        <SectionWordingSettings block={journeyList} />
      </StaticEditor>
    )

    const input = screen.getByRole('textbox', { name: 'No journeys message' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Coming\nsoon' } })

    expect(input).toHaveValue('Coming\nsoon')
    await waitFor(() => expect(mock.result).toHaveBeenCalled())
  })

  it('shows the All regions label on the header', () => {
    render(
      <StaticEditor initialState={{ previewLanguageId: '529' }}>
        <SectionWordingSettings block={blockById('headerId')} />
      </StaticEditor>
    )

    expect(
      screen.getByRole('textbox', { name: 'All regions label' })
    ).toHaveValue('All regions')
  })

  it('shows the All regions label on an Analytics section', () => {
    render(
      <StaticEditor initialState={{ previewLanguageId: '529' }}>
        <SectionWordingSettings block={blockById('regionAnalyticsId')} />
      </StaticEditor>
    )

    expect(
      screen.getByRole('textbox', { name: 'All regions label' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Total visitors tile' })
    ).toBeInTheDocument()
  })

  it('renders nothing for the Region Header, which reads no wording', () => {
    render(
      <StaticEditor>
        <SectionWordingSettings block={blockById('regionHeaderId')} />
      </StaticEditor>
    )

    expect(screen.queryByTestId('SectionWordingSettings')).toBeNull()
  })

  it.each(['CampaignHeroBlock', 'CampaignFeaturedMediaBlock'] as const)(
    'shows the video count word on a %s',
    (__typename) => {
      render(
        <StaticEditor initialState={{ previewLanguageId: '529' }}>
          <SectionWordingSettings block={{ __typename }} />
        </StaticEditor>
      )

      expect(
        screen.getByRole('textbox', { name: 'Video count word' })
      ).toHaveValue('videos')
    }
  )

  it('names every key', () => {
    const {
      result: {
        current: { t }
      }
    } = renderHook(() => useTranslation('apps-journeys-admin'))
    for (const key of Object.values(CampaignStringKey)) {
      expect(stringKeyLabel(t, key)).not.toBe(key)
    }
  })
})
