import { render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { JourneyDetails } from './JourneyDetails'

describe('JourneyDetails', () => {
  const mockJourney: JourneyFields = {
    title: 'Some title',
    description: 'Some description'
  } as unknown as JourneyFields

  it('should display title and description', () => {
    render(
      <JourneyProvider value={{ journey: mockJourney }}>
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent(
      'Some title'
    )
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })
})
