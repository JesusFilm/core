import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListItem, RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'

import { LangaugeRefinement } from '.'

import '../../../test/i18n'

jest.mock('react-instantsearch')

const languageRefinements: RefinementListItem[] = [
  {
    count: 842,
    isRefined: false,
    value: "English",
    label: "English",
    highlighted: "English"
  },
  {
    count: 561,
    isRefined: false,
    value: "Spanish, Latin American",
    label: "Spanish, Latin American",
    highlighted: "Spanish, Latin American"
  },
  {
    count: 509,
    isRefined: false,
    value: "Chinese, Mandarin",
    label: "Chinese, Mandarin",
    highlighted: "Chinese, Mandarin"
  },
  {
    count: 297,
    isRefined: false,
    value: "Cantonese",
    label: "Cantonese",
    highlighted: "Cantonese"
  },
  {
    count: 227,
    isRefined: false,
    value: "Spanish, Castilian",
    label: "Spanish, Castilian",
    highlighted: "Spanish, Castilian"
  },
  {
    count: 79,
    isRefined: false,
    value: "Chinese, Simplified",
    label: "Chinese, Simplified",
    highlighted: "Chinese, Simplified"
  },
  {
    count: 46,
    isRefined: false,
    value: "Chinese, Traditional",
    label: "Chinese, Traditional",
    highlighted: "Chinese, Traditional"
  }
]

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

function mockRefinementList(): jest.Mock {
  const refine = jest.fn()
  mockUseRefinementList.mockReturnValue({
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState)
  return refine
}

describe('LangaugeRefinement', () => {
  beforeEach(() => {
    mockRefinementList()
  })

  it('should have languages header', () => {
    render(<LangaugeRefinement/>)
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should have languages listed', () => {
    render(<LangaugeRefinement/>)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should refine when langauge selected', () => {
    const refine = mockRefinementList()
    render(<LangaugeRefinement/>)
    fireEvent.click(screen.getByText('Cantonese'))
    expect(refine).toHaveBeenCalled()
  })
})