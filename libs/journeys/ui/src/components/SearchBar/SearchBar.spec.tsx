import { fireEvent, render, screen } from '@testing-library/react'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'

import '../../../test/i18n'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

function mockSearchBox(): jest.Mock<any, any, any> {
  const refine = jest.fn()
  mockUseSearchBox.mockReturnValue({
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState)
  return refine
}

describe('SearchBar', () => {
  beforeEach(() => {
    mockSearchBox()
  })

  it('should render input field', async () => {
    render(<SearchBar />)
    expect(screen.getByDisplayValue('Hello World!')).toBeInTheDocument()
  })

  it('should have placeholder text', async () => {
    render(<SearchBar />)
    const inputElement = screen.getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeInTheDocument()
  })

  it('should have globe icon', async () => {
    render(<SearchBar />)
    const searchIcon = screen.getByTestId('Search1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should refine when text typed', async () => {
    const refine = mockSearchBox()
    render(<SearchBar />)
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'Hello' } })
    expect(refine).toHaveBeenCalled()
  })
})
