import { InstantSearchMockWrapper } from '@core/journeys/ui/mocks/InstantSearchMockWrapper'
import { render, screen } from '@testing-library/react'
import { StrategiesContent } from './StrategiesContent'

describe('StrategiesContent', () => {
  it('should render strategiescontent', () => {
    render(
      <InstantSearchMockWrapper>
        <StrategiesContent />
      </InstantSearchMockWrapper>
    )

    expect(screen.getByTestId('StrategiesContent')).toBeInTheDocument()
  })
})
