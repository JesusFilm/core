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

  it('should render card tab component', async () => {
    const { getByText } = render(
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
  })

  // todo: write video tab tests when implemented
  it.skip('should switch between tabs', async () => {
    const { getByText, getByRole } = render(
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
    fireEvent.click(getByRole('tab', { name: '{{videoBlockCount}} Videos' }))
    await waitFor(() => {
      expect(getByRole('tab', { selected: true })).toHaveTextContent(
        '{{videoBlockCount}} Videos'
      )
    })
  })

  // todo: write video tab tests when implemented
  it.skip('should disable videos tab if no videos in journey', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: undefined,
            variant: 'admin'
          }}
        >
          <TemplatePreviewTabs />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('{{cardBlockCount}} Cards')).toBeInTheDocument()
    expect(
      getByRole('tab', { name: '{{videoBlockCount}} Videos' })
    ).toBeDisabled()
  })
})
