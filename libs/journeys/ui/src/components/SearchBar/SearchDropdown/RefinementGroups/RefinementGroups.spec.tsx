import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'

import { SearchBarProvider } from '../../../../libs/algolia/SearchBarProvider'
import { languageRefinements } from '../../data'

import { RefinementGroups } from './RefinementGroups'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('RefinementGroups', () => {
  const refinements = {
    items: languageRefinements,
    refine: jest.fn()
  } as unknown as RefinementListRenderState

  const languages = {
    'North America': ['English'],
    Europe: ['French', 'Spanish, Castilian'],
    Oceania: ['Bislama'],
    Africa: ['Deutsch'],
    Asia: ['Cantonese', 'Chinese, Simplified'],
    'South America': ['Spanish, Latin American']
  }

  const useSearchBox = {
    query: 'Hello World!',
    refine: jest.fn()
  } as unknown as SearchBoxRenderState

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(useSearchBox)
  })

  it('should render the correct continent headers', () => {
    render(
      <SearchBarProvider>
        <RefinementGroups refinements={refinements} languages={languages} />
      </SearchBarProvider>
    )
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('North America')).toBeInTheDocument()
    expect(screen.getByText('South America')).toBeInTheDocument()
  })

  it('should render the correct languages', () => {
    render(
      <SearchBarProvider>
        <RefinementGroups refinements={refinements} languages={languages} />
      </SearchBarProvider>
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Cantonese')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Castilian')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Simplified')).toBeInTheDocument()
  })

  it('should render message if no languages', () => {
    render(
      <RefinementGroups
        refinements={
          {
            items: [],
            refine: jest.fn()
          } as unknown as RefinementListRenderState
        }
        languages={languages}
      />
    )
    expect(
      screen.getByText(
        `Sorry, there are no languages available for this search. Try removing some of your search criteria!`
      )
    ).toBeInTheDocument()
  })

  it('should render a see all button', () => {
    const showMoreRefinements = {
      ...refinements,
      canToggleShowMore: true,
      isShowingMore: false,
      toggleShowMore: jest.fn()
    }
    render(
      <SearchBarProvider>
        <RefinementGroups
          refinements={showMoreRefinements}
          languages={languages}
        />
      </SearchBarProvider>
    )
    expect(screen.getByText('See All')).toBeInTheDocument()
  })

  it('should render a see less button', () => {
    const showMoreRefinements = {
      ...refinements,
      canToggleShowMore: true,
      isShowingMore: true,
      toggleShowMore: jest.fn()
    }
    render(
      <SearchBarProvider>
        <RefinementGroups
          refinements={showMoreRefinements}
          languages={languages}
        />
      </SearchBarProvider>
    )
    expect(screen.getByText('See Less')).toBeInTheDocument()
  })

  it('should call toggleShowMore when see all button clicked', () => {
    const toggleShowMore = jest.fn()
    const showMoreRefinements = {
      ...refinements,
      canToggleShowMore: true,
      isShowingMore: false,
      toggleShowMore
    }
    render(
      <SearchBarProvider>
        <RefinementGroups
          refinements={showMoreRefinements}
          languages={languages}
        />
      </SearchBarProvider>
    )
    const seeAllButton = screen.getByText('See All')
    fireEvent.click(seeAllButton)
    expect(toggleShowMore).toHaveBeenCalled()
  })
})
