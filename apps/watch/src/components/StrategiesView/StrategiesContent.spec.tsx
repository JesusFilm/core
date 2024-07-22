import { InstantSearchMockWrapper } from '@core/journeys/ui/mocks/InstantSearchMockWrapper'
import { render, screen } from '@testing-library/react'
import { StrategiesView } from './StrategiesView'

describe('StrategiesView', () => {
  it('should render strategiesview', () => {
    render(
      <InstantSearchMockWrapper>
        <StrategiesView />
      </InstantSearchMockWrapper>
    )
    const titleText = screen.getByTestId('InteractionText')
    expect(titleText).toHaveTextContent('Resource for every interaction')
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
    expect(screen.getByTestId('StrategySections')).toBeInTheDocument()
  })
})
