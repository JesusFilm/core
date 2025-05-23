import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ClearRefinementsRenderState } from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  useClearRefinements,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'

import '../../../test/i18n'
import { SearchBarProvider } from '../../libs/algolia/SearchBarProvider'
import { getLanguagesContinentsMock } from '../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'

import { fetchCountryMock, languageRefinements } from './data'
import { SearchBar } from './SearchBar'

global.fetch = jest.fn(fetchCountryMock) as jest.Mock

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

const mockUseClearRefinements = useClearRefinements as jest.MockedFunction<
  typeof useClearRefinements
>

async function clickOnSearchBar(): Promise<void> {
  const searchBar = screen.getByTestId('SearchBarInput')
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

  const clearRefinements = {
    refine: jest.fn(),
    canRefine: false
  } as unknown as ClearRefinementsRenderState

  beforeEach(() => {
    mockUseRefinementList.mockReturnValue(useRefinementList)
    mockUseSearchBox.mockReturnValue(useSearchBox)
    mockUseClearRefinements.mockReturnValue(clearRefinements)
  })

  it('should render input field', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByDisplayValue('Hello World!')).toBeVisible()
  })

  it('should have placeholder text', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar />
        </SearchBarProvider>
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
        <SearchBarProvider>
          <SearchBar />
        </SearchBarProvider>
      </MockedProvider>
    )
    const searchIcon = screen.getByTestId('Search1Icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should refine when text typed', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar />
        </SearchBarProvider>
      </MockedProvider>
    )
    const input = screen.getByDisplayValue('Hello World!')
    fireEvent.change(input, { target: { value: 'Testing' } })
    await waitFor(() => expect(refine).toHaveBeenCalled())
  })

  it('should refine once when further keystrokes', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar />
        </SearchBarProvider>
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
        <SearchBarProvider>
          <SearchBar showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
  })

  it('should render language button', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getAllByText('Language')[0]).toBeVisible()
  })

  it('should have dropdown closed by default', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.queryByTestId('SearchBarDropdown')).not.toBeInTheDocument()
  })

  it('should render search bar dropdown', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown />
        </SearchBarProvider>
      </MockedProvider>
    )
    await clickOnSearchBar()
    expect(screen.queryByTestId('SearchBarDropdown')).toBeInTheDocument()
  })

  it('should open suggestions dropdown when searchbar clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown />
        </SearchBarProvider>
      </MockedProvider>
    )
    await clickOnSearchBar()
    expect(screen.queryByTestId('SearchBarDropdown')).toBeInTheDocument()
    expect(screen.getByText('Search Suggestions')).toBeVisible()
  })

  it('should open languages dropdown when language button clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(screen.getAllByText('Language')[0]).toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Language')[0])

    await waitFor(() =>
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    )
    await waitFor(() => expect(screen.getByText('Asia')).toBeInTheDocument())
  })

  it('should not switch back to suggestions after languages button clicked', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getAllByText('Language')[0])
    expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    await clickOnSearchBar()
    await waitFor(() => expect(screen.getByText('Europe')).toBeInTheDocument())
  }, 15000)

  it('should navigate to suggestions tab from languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown showLanguageButton />
        </SearchBarProvider>
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
        <SearchBarProvider>
          <SearchBar showDropdown showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    await clickOnSearchBar()
    expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Languages'))

    await waitFor(() => expect(screen.getByText('Cantonese')).toBeVisible())
  })

  const enterKey = {
    key: 'Enter',
    code: 'Enter',
    charCode: 13
  }

  it('should close dropdown on key enter', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    await clickOnSearchBar()
    fireEvent.keyDown(screen.getByDisplayValue('Hello World!'), enterKey)
    expect(screen.queryByTestId('SearchBarDropdown')).not.toBeInTheDocument()
  })

  it('should open dropdown again after closing on key enter', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <SearchBar showDropdown showLanguageButton />
        </SearchBarProvider>
      </MockedProvider>
    )
    await clickOnSearchBar()
    fireEvent.keyDown(screen.getByDisplayValue('Hello World!'), enterKey)
    await clickOnSearchBar()
    await waitFor(() =>
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    )
  })
})
