import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { publishedJourney } from '../data'

import { journeyVideoBlocks } from './data'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'
import '../../../../test/i18n'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplatePreviewTabs', () => {
  const journeyWithVideos = {
    ...publishedJourney,
    blocks: journeyVideoBlocks
  }

  beforeEach(() => jest.clearAllMocks())

  it('should render tabs component', async () => {
    const { getByText, getAllByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithVideos as JourneyFields,
            variant: 'admin'
          }}
        >
          <TemplatePreviewTabs />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('5 Cards')).toBeInTheDocument()
    await waitFor(() =>
      expect(getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(5)
    )
    expect(getByText('5 Videos')).toBeInTheDocument()
  })

  it('should render videos tabs content', async () => {
    const { getByText, getAllByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithVideos as JourneyFields,
            variant: 'admin'
          }}
        >
          <TemplatePreviewTabs />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('5 Cards')).toBeInTheDocument()
    await waitFor(() => fireEvent.click(getByText('5 Videos')))
    expect(getAllByTestId('TemplateVideosSwiperSlide')).toHaveLength(5)
  })
})
