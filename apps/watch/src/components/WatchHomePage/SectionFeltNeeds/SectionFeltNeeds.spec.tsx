import { fireEvent, render, screen } from '@testing-library/react'
import { useSearchBox } from 'react-instantsearch'

import { SectionFeltNeeds } from './SectionFeltNeeds'

jest.mock('react-instantsearch')

const mockAlgoliaVideoGrid = jest
  .fn()
  .mockImplementation(({ languageId }: { languageId?: string }) => (
    <div data-testid="AlgoliaVideoGridMock">{languageId ?? 'none'}</div>
  ))

jest.mock('../../VideoGrid/AlgoliaVideoGrid', () => ({
  AlgoliaVideoGrid: (props: unknown) => mockAlgoliaVideoGrid(props)
}))

describe('SectionFeltNeeds', () => {
  const refine = jest.fn()

  beforeEach(() => {
    refine.mockReset()
    mockAlgoliaVideoGrid.mockClear()
    ;(useSearchBox as jest.MockedFunction<typeof useSearchBox>).mockReturnValue({
      refine
    })
  })

  it('renders default query and share tip', () => {
    render(<SectionFeltNeeds languageId="529" />)

    expect(screen.getByTestId('FeltNeedsSearchInput')).toHaveValue('anxiety')
    expect(refine).toHaveBeenCalledWith('anxiety')
    expect(
      screen.getByTestId('FeltNeedsShareTips')
    ).toHaveTextContent('acknowledging their anxiety')
    expect(mockAlgoliaVideoGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        languageId: '529',
        analyticsTag: 'felt-needs',
        showLoadMore: true
      })
    )
  })

  it('updates search when selecting a felt need', () => {
    render(<SectionFeltNeeds />)

    refine.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Hope' }))

    expect(refine).toHaveBeenLastCalledWith('hope')
    expect(
      screen.getByTestId('FeltNeedsShareTips')
    ).toHaveTextContent('gave you hope')
  })

  it('handles typed queries with generic share tip', () => {
    render(<SectionFeltNeeds />)

    refine.mockClear()
    fireEvent.change(screen.getByTestId('FeltNeedsSearchInput'), {
      target: { value: 'anxiety help' }
    })

    expect(refine).toHaveBeenLastCalledWith('anxiety help')
    expect(screen.getByTestId('FeltNeedsSearchInput')).toHaveValue(
      'anxiety help'
    )
    expect(screen.getByText(/video about anxiety help/i)).toBeInTheDocument()
  })
})
