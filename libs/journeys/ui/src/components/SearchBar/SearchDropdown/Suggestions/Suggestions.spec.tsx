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
    query: 'Jesus'
  } as unknown as SearchBoxRenderState

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(searchBox)
    jest.clearAllMocks()
  })

  it('should display suggestion in english', () => {
    render(<Suggestions refinements={refinements} />)
    expect(screen.getByText('- in English')).toBeInTheDocument()
  })

  it('should display suggestion in english and spanish', () => {
    render(<Suggestions refinements={refinements} />)
    expect(
      screen.getByText('- in English and Spanish, Latin American')
    ).toBeInTheDocument()
  })

  it('should refine once on click of suggestion with one language filter', () => {
    render(<Suggestions refinements={refinements} />)
    const firstSuggestion = screen.getByText('- in English')
    fireEvent.click(firstSuggestion)
    expect(refine).toHaveBeenCalled()
  })

  it('should refine twice on click of suggestion with two language filters', () => {
    render(<Suggestions refinements={refinements} />)
    const secondSuggestion = screen.getByText(
      '- in English and Spanish, Latin American'
    )
    fireEvent.click(secondSuggestion)
    expect(refine).toHaveBeenCalledTimes(2)
  })

  it('should refine language on suggestion click', () => {
    render(<Suggestions refinements={refinements} />)
    const firstSuggestion = screen.getByText('- in English')
    fireEvent.click(firstSuggestion)
    expect(refine).toHaveBeenCalledWith('English')
  })

  it('should refine multiple languages on suggestion click', () => {
    render(<Suggestions refinements={refinements} />)
    const secondSuggestion = screen.getByText(
      '- in English and Spanish, Latin American'
    )
    fireEvent.click(secondSuggestion)
    expect(refine).toHaveBeenCalledWith('English')
    expect(refine).toHaveBeenCalledWith('Spanish, Latin American')
  })

  it('should not give suggestion with refined item', () => {
    const refinedLanguage = {
      count: 842,
      isRefined: true,
      value: 'English',
      label: 'English',
      highlighted: 'English'
    }
    const languageRefinementsWithRefined = languageRefinements.slice(1, -1)
    languageRefinementsWithRefined.push(refinedLanguage)
    const refinementsWithRefined = {
      items: languageRefinementsWithRefined,
      refine
    } as unknown as RefinementListRenderState

    render(<Suggestions refinements={refinementsWithRefined} />)
    expect(screen.queryByText('- in English')).not.toBeInTheDocument()
  })

  it('should show suggestions using query string', () => {
    mockUseSearchBox.mockReturnValue({
      query: 'Discipleship'
    } as unknown as SearchBoxRenderState)

    render(<Suggestions refinements={refinements} />)
    expect(screen.getAllByText('Discipleship')).toHaveLength(2)
  })
})
