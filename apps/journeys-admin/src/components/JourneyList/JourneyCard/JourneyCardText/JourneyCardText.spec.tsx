import { fireEvent, render, waitFor } from '@testing-library/react'

import {
  defaultJourney,
  oldJourney,
  publishedJourney
} from '../../journeyListData'
import { JourneyCardVariant } from '../journeyCardVariant'

import { JourneyCardText } from '.'

describe('JourneyCardText', () => {
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
        journey={publishedJourney}
        variant={JourneyCardVariant.default}
      />
    )
    expect(getByText('January 1 - a published journey')).toBeInTheDocument()
  })

  it('should show formatted date', () => {
    const { getByText } = render(
      <JourneyCardText
        journey={defaultJourney}
        variant={JourneyCardVariant.default}
      />
    )
    expect(getByText('January 1')).toBeInTheDocument()
  })

  it('should show date with year if journey is created before the current year', () => {
    const { getByText } = render(
      <JourneyCardText
        journey={oldJourney}
        variant={JourneyCardVariant.default}
      />
    )
    expect(
      getByText(
        'November 19, 2020 - Journey created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
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
    fireEvent.focusIn(getByTestId('CircleRoundedIcon'))
    await waitFor(async () =>
      expect(getByRole('tooltip', { name: 'New' })).toBeInTheDocument()
    )
  })
})
