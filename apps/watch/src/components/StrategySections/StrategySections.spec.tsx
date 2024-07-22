import { InstantSearchMockWrapper } from '@core/journeys/ui/mocks/InstantSearchMockWrapper'
import { render, screen } from '@testing-library/react'
import { StrategySections } from './StrategySections'

// TODO: revisit this test once wrapper is fixed
describe('StrategySections', () => {
  it('should render strategysections', () => {
    render(
      <InstantSearchMockWrapper>
        <StrategySections />
      </InstantSearchMockWrapper>
    )

    expect(screen.getAllByTestId('StrategySection')).toHaveLength(2)
  })
})
