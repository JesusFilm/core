import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useHits, useSearchBox } from 'react-instantsearch'

import { strategyItems } from '../StrategySections/StrategySection/data'

import { StrategiesView } from './StrategiesView'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

function mockSearchBox(): jest.Mock {
  const refine = jest.fn()
  mockUseSearchBox.mockReturnValue({
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState)
  return refine
}

const mockedUseHits = useHits as jest.MockedFunction<typeof useHits>

function mockUseHits(): void {
  mockedUseHits.mockReturnValue({
    hits: strategyItems
  } as unknown as HitsRenderState)
}

describe('StrategiesView', () => {
  beforeEach(() => {
    mockSearchBox()
    mockUseHits()
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
