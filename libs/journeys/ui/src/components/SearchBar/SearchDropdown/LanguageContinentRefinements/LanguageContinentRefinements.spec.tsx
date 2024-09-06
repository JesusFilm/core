import { fireEvent, render, screen } from '@testing-library/react'
import { ClearRefinementsRenderState } from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useClearRefinements } from 'react-instantsearch'

import { languageRefinements } from '../../data'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'

jest.mock('react-instantsearch')

const mockUseClearRefinements = useClearRefinements as jest.MockedFunction<
  typeof useClearRefinements
>

describe('LanguageContinentRefinements', () => {
  const refinements = {
    items: languageRefinements,
    refine: jest.fn()
  } as unknown as RefinementListRenderState

  const clearRefinements = {
    refine: jest.fn(),
    canRefine: false
  } as unknown as ClearRefinementsRenderState

  const languages = {
    'North America': ['English'],
    Europe: ['French', 'Spanish, Castilian'],
    Oceania: ['Bislama'],
    Africa: ['Deutsch'],
    Asia: ['Cantonese', 'Chinese, Simplified'],
    'South America': ['Spanish, Latin American']
  }

  beforeEach(() => {
    mockUseClearRefinements.mockReturnValue(clearRefinements)
  })

  it('should render the correct continent headers', () => {
    render(
      <LanguageContinentRefinements
        refinements={refinements}
        languages={languages}
      />
    )
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('North America')).toBeInTheDocument()
    expect(screen.getByText('South America')).toBeInTheDocument()
  })

  it('should render the correct languages', () => {
    render(
      <LanguageContinentRefinements
        refinements={refinements}
        languages={languages}
      />
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Cantonese')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Castilian')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Simplified')).toBeInTheDocument()
  })

  it('should render message if no languages', () => {
    render(
      <LanguageContinentRefinements
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
      <LanguageContinentRefinements
        refinements={showMoreRefinements}
        languages={languages}
      />
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
      <LanguageContinentRefinements
        refinements={showMoreRefinements}
        languages={languages}
      />
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
      <LanguageContinentRefinements
        refinements={showMoreRefinements}
        languages={languages}
      />
    )
    const seeAllButton = screen.getByText('See All')
    fireEvent.click(seeAllButton)
    expect(toggleShowMore).toHaveBeenCalled()
  })

  it('should not show clear all button if cannot clear refinements', () => {
    render(
      <LanguageContinentRefinements
        refinements={refinements}
        languages={languages}
      />
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
      <LanguageContinentRefinements
        refinements={refinements}
        languages={languages}
      />
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
      <LanguageContinentRefinements
        refinements={refinements}
        languages={languages}
      />
    )

    fireEvent.click(screen.getByText('Clear All'))
    expect(refine).toHaveBeenCalled()
  })
})
