import { fireEvent, render, screen } from '@testing-library/react'
import { useSearchBox } from 'react-instantsearch'
import '../../../test/i18n'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')
const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('SearchBar', () => {
  const refine = jest.fn()
  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      query: 'Hello World!',
      refine
    } as unknown as SearchBoxRenderState)
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
    render(<SearchBar />)
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'Hello' } })
    expect(refine).toHaveBeenCalled()
  })
})
