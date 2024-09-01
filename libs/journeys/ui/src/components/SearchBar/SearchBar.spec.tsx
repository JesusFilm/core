import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useRefinementList, useSearchBox } from 'react-instantsearch'

import '../../../test/i18n'
import { languageRefinements } from './data'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('SearchBar', () => {
  const refine = jest.fn()
  const useRefinementList = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState
  const useSearchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  beforeEach(() => {
    mockUseRefinementList.mockReturnValue(useRefinementList)
    mockUseSearchBox.mockReturnValue(useSearchBox)
  })

  it('should render input field', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    expect(screen.getByDisplayValue('Hello World!')).toBeInTheDocument()
  })

  it('should have placeholder text', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    const inputElement = screen.getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeInTheDocument()
  })

  it('should have globe icon', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    const searchIcon = screen.getByTestId('Search1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should refine when text typed', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'Testing' } })
    await waitFor(() => expect(refine).toHaveBeenCalled())
  })

  it('should refine once when further keystrokes', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'J' } })
    fireEvent.change(input, { target: { value: 'Je' } })
    fireEvent.change(input, { target: { value: 'Jes' } })
    await waitFor(() => expect(refine).toHaveBeenCalledTimes(1))
  })

  it('should have language icon', async () => {
    render(
      <MockedProvider>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    const searchIcon = screen.getByTestId('Globe1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should render language', async () => {
    render(
      <MockedProvider>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('should have dropdown closed by default', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    expect(screen.queryByTestId('SearchLanguageFilter')).not.toBeInTheDocument()
  })

  it('should open dropdown when searchbar clicked', async () => {
    render(
      <MockedProvider>
        <SearchBar />
      </MockedProvider>
    )
    const inputElement = screen.getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    fireEvent.click(inputElement)
    expect(screen.getByTestId('SearchLanguageFilter')).toBeInTheDocument()
  })

  it('should open dropdown when language button clicked', async () => {
    render(
      <MockedProvider>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    expect(screen.getByText('Language')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Language'))
    expect(screen.getByTestId('SearchLanguageFilter')).toBeInTheDocument()
  })

  it('should close dropdown after it was opened', async () => {
    render(
      <MockedProvider>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getByText('Language'))
    expect(screen.getByTestId('SearchLanguageFilter')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Language'))
    expect(screen.queryByTestId('SearchLanguageFilter')).not.toBeInTheDocument()
  })
})
