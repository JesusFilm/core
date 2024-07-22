import { fireEvent, render, screen } from '@testing-library/react'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'
import '../../../test/i18n'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')

function mockUseSearchBox() {
  const refine = jest.fn()
  const useSearchBoxMocked = jest.mocked(useSearchBox)
  useSearchBoxMocked.mockReturnValue({
    query: 'Hello World!',
    refine: refine
  } as unknown as SearchBoxRenderState)
  return refine
}

describe('SearchBar', () => {
  beforeEach(() => {
    mockUseSearchBox()
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
    const refine = mockUseSearchBox()
    render(<SearchBar />)
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'Hello' } })
    expect(refine).toHaveBeenCalled()
  })

  it('should have language icon', async () => {
    render(<SearchBar />)
    const searchIcon = screen.getByTestId('Globe1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should render english language by default', async () => {
    render(<SearchBar />)
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('should be clickable', async () => {
    render(<SearchBar />)
    const languageButton = screen.getByTestId('LanguageSelect')
    fireEvent.click(languageButton)
  })
})
