import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { HttpResponse, http } from 'msw'
import { useHits, useRefinementList, useSearchBox } from 'react-instantsearch'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'

import { server } from '../../../test/mswServer'

import { resourceItems } from './ResourceSections/ResourceSection/data'
import { ResourcesView } from './ResourcesView'

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

    server.use(
      http.get('http://localhost/api/geolocation', () =>
        HttpResponse.json({
          country: 'US'
        })
      )
    )
  })

  it('should render interaction text', () => {
    render(
      <MockedProvider>
        <SearchBarProvider>
          <ResourcesView />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Resources for every')).toBeInTheDocument()
    expect(screen.getByText('interaction')).toBeInTheDocument()
  })

  it('should render searchbar', () => {
    render(
      <MockedProvider>
        <SearchBarProvider>
          <ResourcesView />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
  })

  it('should render resource sections', () => {
    render(
      <MockedProvider>
        <SearchBarProvider>
          <ResourcesView />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('ResourceSections')).toBeInTheDocument()
  })
})
