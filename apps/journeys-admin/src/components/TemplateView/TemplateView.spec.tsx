import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../__generated__/JourneyFields'
import { defaultJourney } from '../JourneyView/data'

import { TemplateView } from './TempateView'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
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
          <TemplateView />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('Strategy')).toBeInTheDocument()
  })

  it('should not render Strategy section if journey strategy slug is null', () => {
    const journeyWithStrategySlug: JourneyFields = {
      ...defaultJourney,
      strategySlug: null
    }
    const { queryByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithStrategySlug,
            variant: 'admin'
          }}
        >
          <TemplateView />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
  })
})
