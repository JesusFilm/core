import { render } from '@testing-library/react'
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

    const useInstantSearchMocked = jest.mocked(useInstantSearch)
    useInstantSearchMocked.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)
  })

  it('should render input field', async () => {
    const { getByDisplayValue } = render(<SearchBar />)
    expect(getByDisplayValue('Hello World!')).toBeInTheDocument()
  })

  it('should have placeholder text', async () => {
    const { getByPlaceholderText } = render(<SearchBar />)
    const inputElement = getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeInTheDocument()
  })

  it('should have globe icon', async () => {
    const { getByTestId } = render(<SearchBar />)
    const searchIcon = getByTestId('Search1Icon')
    expect(searchIcon).toBeInTheDocument()
  })
})
