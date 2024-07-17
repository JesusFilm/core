import { InstantSearchTestWrapper } from '@core/journeys/ui/mocks/InstantSearchWrapper'
import { render, screen } from '@testing-library/react'
import { StrategySections } from './StrategySections'

describe('StrategySections', () => {
  it('should render strategysections', () => {
    render(
      <InstantSearchTestWrapper>
        <StrategySections />
      </InstantSearchTestWrapper>
    )

    expect(screen.getByTestId('StrategySections')).toBeInTheDocument()
  })
})
