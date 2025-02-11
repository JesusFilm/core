import { fireEvent, render, waitFor } from '@testing-library/react'

import { defaultJourney, publishedJourney } from '../../journeyListData'
import { JourneyCardVariant } from '../journeyCardVariant'

import { JourneyCardText } from '.'

describe('JourneyCardText', () => {
  const YEAR_MILLISECONDS = 365.25 * 24 * 60 * 60000

  it('should show title', () => {
    const { getByText } = render(
      <JourneyCardText
        journey={publishedJourney}
        variant={JourneyCardVariant.default}
      />
    )
    expect(getByText('Published Journey Heading')).toBeInTheDocument()
  })

  it('should show description with a dash', () => {
    const { getByText } = render(
      <JourneyCardText
        journey={{
          ...publishedJourney,
          updatedAt: new Date(Date.now() - YEAR_MILLISECONDS).toISOString()
        }}
        variant={JourneyCardVariant.default}
      />
    )
    expect(getByText('1 year ago')).toBeInTheDocument()
    expect(getByText('- a published journey')).toBeInTheDocument()
  })

  it('should show formatted date', () => {
    const { getByText } = render(
      <JourneyCardText
        journey={defaultJourney}
        variant={JourneyCardVariant.default}
      />
    )
    expect(getByText('4 years ago')).toBeInTheDocument()
  })

  it('should show badge for new journey card variant', () => {
    const { getByTestId } = render(
      <JourneyCardText
        journey={defaultJourney}
        variant={JourneyCardVariant.new}
      />
    )
    expect(getByTestId('new-journey-badge')).toBeInTheDocument()
  })

  it('should have tool tip for new journey badge', async () => {
    const { getByTestId, getByRole } = render(
      <JourneyCardText
        journey={defaultJourney}
        variant={JourneyCardVariant.new}
      />
    )

    fireEvent.mouseOver(getByTestId('CircleRoundedIcon'))
    await waitFor(async () =>
      expect(getByRole('tooltip', { name: 'New' })).toBeInTheDocument()
    )
  })
})
