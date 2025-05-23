import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ClearRefinementsRenderState } from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import noop from 'lodash/noop'
import {
  useClearRefinements,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'

import {
  SearchBarProvider,
  SearchBarState
} from '../../../libs/algolia/SearchBarProvider'
import { sortedLanguageContinents } from '../../../libs/useLanguagesContinentsQuery/sortLanguageContinents/data'
import { getLanguagesContinentsMock } from '../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'
import { languageRefinements } from '../data'

import { SearchbarDropdown } from './SearchbarDropdown'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

const mockUseClearRefinements = useClearRefinements as jest.MockedFunction<
  typeof useClearRefinements
>

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('SearchbarDropdown', () => {
  const refine = jest.fn()

  const refinements = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  const searchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  const emptyRefinements = {
    items: [],
    refine: jest.fn()
  } as unknown as RefinementListRenderState

  const clearRefinements = {
    refine: jest.fn(),
    canRefine: false
  } as unknown as ClearRefinementsRenderState

  const searchBarInitialState: SearchBarState = {
    continentLanguages: sortedLanguageContinents,
    selectedContinentLanguages: {}
  }

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(searchBox)
    mockUseClearRefinements.mockReturnValue(clearRefinements)
    mockUseRefinementList.mockReturnValue(refinements)
    jest.clearAllMocks()
  })

  it('should default to dropdown closed', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open={false}
            refinements={refinements}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.queryByTestId('SearchBarDropdown')).not.toBeInTheDocument()
    })
  })

  it('should render tab headers', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Search Suggestions')).toBeVisible()
    expect(screen.getByText('Languages')).toBeVisible()
  })

  it('should default to suggestions tab', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('- in English')).toBeVisible()
  })

  it('should render languages tab when tab index given', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(screen.getByText('Cantonese')).toBeVisible())
  })

  it('should render the correct continent headers', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.getByText('Asia')).toBeVisible()
    expect(screen.getByText('Europe')).toBeVisible()
    expect(screen.getByText('North America')).toBeVisible()
    expect(screen.getByText('South America')).toBeVisible()
  })

  it('should render the correct languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.getByText('English')).toBeVisible()
    expect(screen.getByText('Spanish, Castilian')).toBeVisible()
    expect(screen.getByText('Spanish, Latin American')).toBeVisible()
    expect(screen.getByText('Cantonese')).toBeVisible()
    expect(screen.getByText('Chinese, Simplified')).toBeVisible()
    expect(screen.getByText('Chinese, Traditional')).toBeVisible()
  })

  it('should render message if no languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={emptyRefinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByText(
        'Sorry, there are no languages available for this search. Try removing some of your search criteria!'
      )
    ).toBeVisible()
  })

  it('should not render headers if no languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={emptyRefinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.queryByText('Africa')).not.toBeInTheDocument()
    expect(screen.queryByText('Asia')).not.toBeInTheDocument()
    expect(screen.queryByText('Europe')).not.toBeInTheDocument()
    expect(screen.queryByText('North America')).not.toBeInTheDocument()
    expect(screen.queryByText('Oceania')).not.toBeInTheDocument()
    expect(screen.queryByText('South America')).not.toBeInTheDocument()
  })

  it('should only render continent headers that have languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.queryByText('Africa')).not.toBeInTheDocument()
    expect(screen.queryByText('Oceania')).not.toBeInTheDocument()
  })

  it('should call refine on language click', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cantonese'))
    })
    expect(refine).toHaveBeenCalledWith('Cantonese')
  })

  it('should refine query when suggestion clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={0}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Search Suggestions')).toBeInTheDocument()
    })
    const firstSuggestion = screen.getByText('- in English')
    fireEvent.click(firstSuggestion)
    await waitFor(() => expect(refine).toHaveBeenCalledWith('English'))
  })

  it('should display number of languages available in tab header', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <SearchbarDropdown
            open
            refinements={refinements}
            tabIndex={1}
            handleTabValueChange={noop}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Search Suggestions')).toBeInTheDocument()
    })
    expect(screen.getByText('7')).toBeVisible()
  })
})
