import { InstantSearchMockWrapper } from '@core/journeys/ui/mocks/InstantSearchMockWrapper'
import { render, screen } from '@testing-library/react'
import { StrategySections } from './StrategySections'

describe('StrategySections', () => {
  it('should render strategysections', () => {
    render(
      <InstantSearchMockWrapper>
        <StrategySections />
      </InstantSearchMockWrapper>
    )

    expect(screen.getByTestId('StrategySection')).toBeInTheDocument()
  })
})
