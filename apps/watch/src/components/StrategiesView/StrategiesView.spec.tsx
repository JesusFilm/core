import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useHits, useRefinementList, useSearchBox } from 'react-instantsearch'

import { StrategiesView } from './StrategiesView'
import { strategyItems } from './StrategySections/StrategySection/data'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockedUseHits = useHits as jest.MockedFunction<typeof useHits>
const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('StrategiesView', () => {
  const refine = jest.fn()

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      query: 'Hello World!',
      refine
    } as unknown as SearchBoxRenderState)

    mockedUseHits.mockReturnValue({
      hits: strategyItems
    } as unknown as HitsRenderState)

    mockUseRefinementList.mockReturnValue({
      items: [
        {
          label: 'English',
          value: 'English',
          isRefined: true
        }
      ],
      refine
    } as unknown as RefinementListRenderState)
  })

  it('should render interaction text', () => {
    render(
      <MockedProvider>
        <StrategiesView />
      </MockedProvider>
    )
    expect(screen.getByText('Resource for every')).toBeInTheDocument()
    expect(screen.getByText('interaction')).toBeInTheDocument()
  })

  it('should render searchbar', () => {
    render(
      <MockedProvider>
        <StrategiesView />
      </MockedProvider>
    )
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
  })

  it('should render strategy sections', () => {
    render(
      <MockedProvider>
        <StrategiesView />
      </MockedProvider>
    )
    expect(screen.getByTestId('StrategySections')).toBeInTheDocument()
  })
})
