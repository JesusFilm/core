import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'

import '../../../../../../test/i18n'
import { SearchBarProvider } from '../../../../../libs/algolia/SearchBarProvider'
import { languageRefinements } from '../../../data'

import { RefinementGroup } from './RefinementGroup'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('RefinementGroup', () => {
  const refine = jest.fn()

  const useRefinementList = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  const useRefinementListWithRefinedValue = {
    items: [
      {
        label: 'Cantonese',
        value: 'Cantonese',
        isRefined: true
      }
    ],
    refine
  } as unknown as RefinementListRenderState

  const useSearchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(useSearchBox)
    jest.clearAllMocks()
  })

  it('should have languages header', () => {
    render(
      <SearchBarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchBarProvider>
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should have languages listed', () => {
    render(
      <SearchBarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchBarProvider>
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should refine when langauge selected', () => {
    render(
      <SearchBarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchBarProvider>
    )
    fireEvent.click(screen.getByText('Cantonese'))
    expect(refine).toHaveBeenCalled()
  })

  it('should render header but no options when refinements list is empty', () => {
    const emptyRefinementList = {
      items: [],
      refine
    } as unknown as RefinementListRenderState
    render(
      <SearchBarProvider>
        <RefinementGroup title="Languages" refinement={emptyRefinementList} />
      </SearchBarProvider>
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('should check the checkbox if title, continent, and refinement match', () => {
    render(
      <SearchBarProvider
        initialState={{
          continentLanguages: {
            Asia: ['Cantonese']
          }
        }}
      >
        <RefinementGroup
          title="Asia"
          refinement={useRefinementListWithRefinedValue}
        />
      </SearchBarProvider>
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeChecked()
  })

  it('should disable the checkbox if the language is selected in a different continent', () => {
    const useRefinementListWithRefinedValue = {
      items: [
        {
          label: 'Cantonese',
          value: 'Cantonese',
          isRefined: true
        }
      ],
      refine
    } as unknown as RefinementListRenderState

    render(
      <SearchBarProvider
        initialState={{
          continentLanguages: {
            Europe: ['Cantonese']
          }
        }}
      >
        <RefinementGroup
          title="Asia"
          refinement={useRefinementListWithRefinedValue}
        />
      </SearchBarProvider>
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeDisabled()
  })

  it('should not refine query when no language in query', () => {
    const refineQuery = jest.fn()
    const useSearchBox = {
      query: 'Hello World!',
      refineQuery
    } as unknown as SearchBoxRenderState
    mockUseSearchBox.mockReturnValue(useSearchBox)

    render(
      <SearchBarProvider>
        <RefinementGroup
          title="Asia"
          refinement={useRefinementListWithRefinedValue}
        />
      </SearchBarProvider>
    )
    expect(refineQuery).not.toHaveBeenCalled()
  })

  it('should not refine query when refinement being unselected', () => {
    const refineQuery = jest.fn()
    const useSearchBox = {
      query: 'Hello World!',
      refineQuery
    } as unknown as SearchBoxRenderState
    mockUseSearchBox.mockReturnValue(useSearchBox)

    render(
      <SearchBarProvider>
        <RefinementGroup
          title="Asia"
          refinement={useRefinementListWithRefinedValue}
        />
      </SearchBarProvider>
    )
    fireEvent.click(screen.getByText('Cantonese'))
    expect(refineQuery).not.toHaveBeenCalled()
  })

  it('should refine query with language-striped query when language in query', async () => {
    const refineQuery = jest.fn()
    const useSearchBox = {
      query: 'Jesus Chinese',
      refine: refineQuery
    } as unknown as SearchBoxRenderState
    mockUseSearchBox.mockReturnValue(useSearchBox)

    render(
      <SearchBarProvider>
        <RefinementGroup title="Asia" refinement={useRefinementList} />
      </SearchBarProvider>
    )
    fireEvent.click(screen.getByText('Chinese, Traditional'))
    await waitFor(() => expect(refineQuery).toHaveBeenCalledWith('Jesus'))
  })

  it('should show tooltip when hovering over langauge', async () => {
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }))

    jest
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockImplementation(() => 200)
    jest
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(() => 100)

    render(
      <SearchBarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchBarProvider>
    )

    fireEvent.mouseOver(screen.getByText('Spanish, Latin American'))
    await waitFor(() =>
      expect(
        screen.getByRole('tooltip', { name: 'Spanish, Latin American' })
      ).toBeInTheDocument()
    )
  })
})
