import { render, screen } from '@testing-library/react'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'
import { StrategiesView } from './StrategiesView'
import '@core/journeys/ui/i18n'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

function mockSearchBox() {
  const refine = jest.fn()
  mockUseSearchBox.mockReturnValue({
    query: 'Hello World!',
    refine: refine
  } as unknown as SearchBoxRenderState)
  return refine
}

describe('StrategiesView', () => {
  beforeEach(() => {
    mockSearchBox()
  })

  it('should render interaction text', () => {
    render(<StrategiesView />)
    expect(screen.getByText('Resource for every')).toBeInTheDocument()
    expect(screen.getByText('interaction')).toBeInTheDocument()
  })

  it('should render searchbar', () => {
    render(<StrategiesView />)
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
  })

  it('should render strategy sections', () => {
    render(<StrategiesView />)
    expect(screen.getByTestId('StrategySections')).toBeInTheDocument()
  })
})
