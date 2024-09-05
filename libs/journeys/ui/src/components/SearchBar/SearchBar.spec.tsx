import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useRefinementList, useSearchBox } from 'react-instantsearch'

import '../../../test/i18n'
import { getLanguagesContinentsMock } from '../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'

import { languageRefinements } from './data'
import { SearchBar } from './SearchBar'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

async function clickOnSearchBar(): Promise<void> {
  const searchBar = screen.getByDisplayValue('Hello World!')
  await act(() => {
    searchBar.click()
    searchBar.focus()
  })
}

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
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar />
      </MockedProvider>
    )
    expect(screen.getByDisplayValue('Hello World!')).toBeVisible()
  })

  it('should have placeholder text', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar />
      </MockedProvider>
    )
    const inputElement = screen.getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeVisible()
  })

  it('should have globe icon', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar />
      </MockedProvider>
    )
    const searchIcon = screen.getByTestId('Search1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should refine when text typed', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar />
      </MockedProvider>
    )
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'Testing' } })
    await waitFor(() => expect(refine).toHaveBeenCalled())
  })

  it('should refine once when further keystrokes', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
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
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    expect(screen.getAllByTestId('Globe1Icon')[0]).toBeVisible()
  })

  it('should render language button', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    expect(screen.getAllByText('Language')[0]).toBeVisible()
  })

  it('should have dropdown closed by default', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar />
      </MockedProvider>
    )
    expect(screen.queryByTestId('SearchBarDropdown')).not.toBeInTheDocument()
  })

  it('should open suggestions dropdown when searchbar clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar />
      </MockedProvider>
    )
    await clickOnSearchBar()
    expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    expect(screen.getByText('Search Suggestions')).toBeVisible()
  })

  it('should open languages dropdown when language button clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    expect(screen.getAllByText('Language')[0]).toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Language')[0])

    await waitFor(() =>
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    )
    expect(screen.getByText('Europe')).toBeInTheDocument()
  })

  it('should not switch back to suggestions after languages button clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getAllByText('Language')[0])
    expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    await clickOnSearchBar()
    await waitFor(() => expect(screen.getByText('Europe')).toBeInTheDocument())
  })

  it('should navigate to suggestions tab from languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getAllByText('Language')[0])
    expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Search Suggestions'))

    await waitFor(() => expect(screen.getByText('- in English')).toBeVisible())
  })

  it('should navigate to languages tab from suggestions', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBar showLanguageButton />
      </MockedProvider>
    )
    await clickOnSearchBar()
    expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Languages'))

    await waitFor(() => expect(screen.getByText('Cantonese')).toBeVisible())
  })
})
