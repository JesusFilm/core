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
    expect(screen.getByText('Resource for every')).toBeInTheDocument()
    expect(screen.getByText('interaction')).toBeInTheDocument()
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
    expect(screen.getByTestId('StrategySections')).toBeInTheDocument()
  })
})
