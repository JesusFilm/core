import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { ClearRefinementsRenderState } from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  useClearRefinements,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'

import {
  SearchBarProvider,
  SearchBarState
} from '../../../../libs/algolia/SearchBarProvider'
import { sortedLanguageContinents } from '../../../../libs/useLanguagesContinentsQuery/sortLanguageContinents/data'
import { getLanguagesContinentsMock } from '../../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'
import { languageRefinements } from '../../data'

import { RefinementGroups } from './RefinementGroups'

jest.mock('react-instantsearch')

const mockUseClearRefinements = useClearRefinements as jest.MockedFunction<
  typeof useClearRefinements
>

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('RefinementGroups', () => {
  const refinements = {
    items: languageRefinements,
    refine: jest.fn()
  } as unknown as RefinementListRenderState

  const clearRefinements = {
    refine: jest.fn(),
    canRefine: false
  } as unknown as ClearRefinementsRenderState

  const useSearchBox = {
    query: 'Hello World!',
    refine: jest.fn()
  } as unknown as SearchBoxRenderState

  const searchBarInitialState: SearchBarState = {
    continentLanguages: sortedLanguageContinents,
    selectedContinentLanguages: {}
  }

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(useSearchBox)
    mockUseClearRefinements.mockReturnValue(clearRefinements)
    mockUseRefinementList.mockReturnValue(refinements)
  })

  it('should render the correct continent headers', () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('North America')).toBeInTheDocument()
    expect(screen.getByText('South America')).toBeInTheDocument()
  })

  it('should render the correct languages', () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Cantonese')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Castilian')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Simplified')).toBeInTheDocument()
  })

  it('should render message if no languages', () => {
    render(
      <SearchBarProvider initialState={searchBarInitialState}>
        <RefinementGroups
          refinements={
            {
              items: [],
              refine: jest.fn()
            } as unknown as RefinementListRenderState
          }
        />
      </SearchBarProvider>
    )
    expect(
      screen.getByText(
        `Sorry, there are no languages available for this search. Try removing some of your search criteria!`
      )
    ).toBeInTheDocument()
  })

  it('should render a see all button', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'See All' })).toBeInTheDocument()
  })

  it('should render a see less button', () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'See All' }))
    expect(screen.getByText('See Less')).toBeInTheDocument()
  })

  it('should not show clear all button if cannot clear refinements', () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    const clearAllButton = screen.queryByText('Clear All')
    expect(clearAllButton).not.toBeInTheDocument()
  })

  it('should show clear all button when one can clear refinements', () => {
    const clearRefinements = {
      refine: jest.fn(),
      canRefine: true
    } as unknown as ClearRefinementsRenderState
    mockUseClearRefinements.mockReturnValue(clearRefinements)

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )

    const clearAllButton = screen.queryByText('Clear All')
    expect(clearAllButton).toBeInTheDocument()
  })

  it('should clear refinements when clear all button clicked', () => {
    const refine = jest.fn()
    const clearRefinements = {
      refine,
      canRefine: true
    } as unknown as ClearRefinementsRenderState
    mockUseClearRefinements.mockReturnValue(clearRefinements)

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarInitialState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Clear All'))
    expect(refine).toHaveBeenCalled()
  })

  it('should show loading when loading languages', () => {
    const searchBarLoadingState: SearchBarState = {
      continentLanguages: {},
      selectedContinentLanguages: {}
    }

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider initialState={searchBarLoadingState}>
          <RefinementGroups refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Loading...')).toBeVisible()
  })
})
