import { render, screen } from '@testing-library/react'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  InstantSearchApi,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'
import '../../../test/i18n'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')

describe('SearchBar', () => {
  beforeEach(() => {
    const useSearchBoxMocked = jest.mocked(useSearchBox)
    useSearchBoxMocked.mockReturnValue({
      query: 'Hello World!',
      refine: jest.fn()
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
})
