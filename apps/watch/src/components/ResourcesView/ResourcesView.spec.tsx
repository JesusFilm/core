import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useHits, useRefinementList, useSearchBox } from 'react-instantsearch'

import { fetchCountryMock } from '@core/journeys/ui/SearchBar/data'

import { resourceItems } from './ResourceSections/ResourceSection/data'
import { ResourcesView } from './ResourcesView'

global.fetch = jest.fn(fetchCountryMock) as jest.Mock

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockedUseHits = useHits as jest.MockedFunction<typeof useHits>
const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('ResourcesView', () => {
  const refine = jest.fn()

  const useSearchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  const useHits = {
    hits: resourceItems
  } as unknown as HitsRenderState

  const useRefinementsList = {
    items: [
      {
        label: 'English',
        value: 'English',
        isRefined: true
      }
    ],
    refine
  } as unknown as RefinementListRenderState

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(useSearchBox)
    mockedUseHits.mockReturnValue(useHits)
    mockUseRefinementList.mockReturnValue(useRefinementsList)
  })

  it('should render interaction text', () => {
    render(
      <MockedProvider>
        <ResourcesView />
      </MockedProvider>
    )
    expect(screen.getByText('Resources for every')).toBeInTheDocument()
    expect(screen.getByText('interaction')).toBeInTheDocument()
  })

  it('should render searchbar', () => {
    render(
      <MockedProvider>
        <ResourcesView />
      </MockedProvider>
    )
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
  })

  it('should render resource sections', () => {
    render(
      <MockedProvider>
        <ResourcesView />
      </MockedProvider>
    )
    expect(screen.getByTestId('ResourceSections')).toBeInTheDocument()
  })
})
