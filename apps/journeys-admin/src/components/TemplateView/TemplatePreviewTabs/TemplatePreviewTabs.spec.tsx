import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { publishedJourney } from '../../JourneyView/data'

import { journeyVideoBlocks } from './data'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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

    expect(getByText('{{cardBlockCount}} Cards')).toBeInTheDocument()
    await waitFor(() =>
      expect(getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(5)
    )
    expect(getByText('{{videoBlockCount}} Videos')).toBeInTheDocument()
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

    expect(getByText('{{cardBlockCount}} Cards')).toBeInTheDocument()
    await waitFor(() =>
      fireEvent.click(getByText('{{videoBlockCount}} Videos'))
    )
    expect(getAllByTestId('TemplateVideosSwiperSlide')).toHaveLength(5)
  })
})
