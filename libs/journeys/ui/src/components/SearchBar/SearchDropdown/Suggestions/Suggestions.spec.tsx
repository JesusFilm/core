import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'

import { languageRefinements } from '../../data'

import { Suggestions } from './Suggestions'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('Suggestions', () => {
  const refine = jest.fn()

  const refinements = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  const searchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(searchBox)
    jest.clearAllMocks()
  })

  it('should display suggestions header', () => {
    render(<Suggestions refinements={refinements} />)
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
  })

  it('should display default suggestions', () => {
    render(<Suggestions refinements={refinements} />)
    expect(screen.getByText('in English')).toBeInTheDocument()
    expect(
      screen.getByText('in English and Spanish, Latin American')
    ).toBeInTheDocument()
  })

  it('should refine on click of first default query', () => {
    render(<Suggestions refinements={refinements} />)
    const firstSuggestion = screen.getByText('in English')
    fireEvent.click(firstSuggestion)
    expect(refine).toHaveBeenCalledTimes(2)
  })

  it('should refine on click of second default query', () => {
    render(<Suggestions refinements={refinements} />)
    const secondSuggestion = screen.getByText(
      'in English and Spanish, Latin American'
    )
    fireEvent.click(secondSuggestion)
    expect(refine).toHaveBeenCalledTimes(3)
  })
})
