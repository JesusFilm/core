import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { User } from 'next-firebase-auth'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../__generated__/JourneyFields'
import { defaultJourney } from '../JourneyView/data'

import { TemplateView } from './TemplateView'

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

describe('TemplateView', () => {
  it('should render Strategy section if journey strategy slug is available', () => {
    const journeyWithStrategySlug: JourneyFields = {
      ...defaultJourney,
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
    }
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithStrategySlug,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('Strategy')).toBeInTheDocument()
  })

  it('should not render Strategy section if journey strategy slug is null', () => {
    const journeyWithoutStrategySlug: JourneyFields = {
      ...defaultJourney,
      strategySlug: null
    }
    const { queryByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithoutStrategySlug,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
  })

  it('should show featured date if journey is featured', () => {
    const journeyWithoutStrategySlug: JourneyFields = {
      ...defaultJourney,
      featuredAt: '2023-10-12T08:00:00Z'
    }
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithoutStrategySlug,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByTestId('featuredAtTemplatePreviewPage')).toBeInTheDocument()
  })
})
