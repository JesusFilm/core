import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'

import '../../../test/i18n'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

function mockSearchBox(): jest.Mock {
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
    fireEvent.change(input, { target: { value: 'Testing' } })
    await waitFor(() => expect(refine).toHaveBeenCalled())
  })

  it('should refine once when further keystrokes', async () => {
    const refine = mockSearchBox()
    render(<SearchBar />)
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'J' } })
    fireEvent.change(input, { target: { value: 'Je' } })
    fireEvent.change(input, { target: { value: 'Jes' } })
    await waitFor(() => expect(refine).toHaveBeenCalledTimes(1))
  })

  it('should have language icon', async () => {
    render(<SearchBar showLanguageButton />)
    const searchIcon = screen.getByTestId('Globe1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should render language', async () => {
    render(<SearchBar showLanguageButton />)
    expect(screen.getByText('Language')).toBeInTheDocument()
  })
})
