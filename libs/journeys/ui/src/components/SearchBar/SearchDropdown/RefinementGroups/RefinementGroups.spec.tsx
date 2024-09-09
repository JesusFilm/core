import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import { SearchbarProvider } from '../../../../libs/SearchbarProvider'
import { languageRefinements } from '../../data'

import { RefinementGroups } from './RefinementGroups'

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

  it('should render the correct continent headers', () => {
    render(
      <SearchbarProvider>
        <RefinementGroups refinements={refinements} languages={languages} />
      </SearchbarProvider>
    )
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('North America')).toBeInTheDocument()
    expect(screen.getByText('South America')).toBeInTheDocument()
  })

  it('should render the correct languages', () => {
    render(
      <SearchbarProvider>
        <RefinementGroups refinements={refinements} languages={languages} />
      </SearchbarProvider>
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
      <SearchbarProvider>
        <RefinementGroups
          refinements={showMoreRefinements}
          languages={languages}
        />
      </SearchbarProvider>
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
      <SearchbarProvider>
        <RefinementGroups
          refinements={showMoreRefinements}
          languages={languages}
        />
      </SearchbarProvider>
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
      <SearchbarProvider>
        <RefinementGroups
          refinements={showMoreRefinements}
          languages={languages}
        />
      </SearchbarProvider>
    )
    const seeAllButton = screen.getByText('See All')
    fireEvent.click(seeAllButton)
    expect(toggleShowMore).toHaveBeenCalled()
  })
})
